from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the speed of our motors

# Motor A control pins
motorAIN1 = Pin(31, Pin.OUT) # Control pin for motor A input 1
motorAIN2 = Pin(32, Pin.OUT) # Control pin for motor A input 2

motorAPWM =  PWM(Pin(33), freq=500, duty_u16=0) # PWM pin for motor A with frequency of 490 Hz and initial duty cycle (on time) of 0

# Motor B control pins (commenting out until next circuit)
motorBIN1 = Pin(21, Pin.OUT) # Control pin for motor B input 1
motorBIN2 = Pin(35, Pin.OUT) # Control pin for motor B input 2
motorBPWM = PWM(Pin(34), freq=500, duty_u16=0) # PWM pin for motor B with frequency of 490 Hz and initial duty cycle (on time) of 0

# Switch pin
switchPin = Pin(28, Pin.IN, Pin.PULL_UP)  # Switch pin with pull-up resistor

# This is the number of milliseconds that it takes the robot to drive 1 inch
# it is set so that if you tell the robot to drive forward 25 units, the robot drives about 25 inches
driveTime = 125

# this is the number of milliseconds that it takes to turn the robot 1 degree
# it is set so that if you tell the robot to turn right 90 units, the robot turns about 90 degrees
turnTime = 10

# Note: these numbers will vary a little bit based on how you mount your motors, the friction of the
# surface that your driving on, and fluctuations in the power to the motors.
# You can change the driveTime and turnTime to make them more accurate

# Function to set motor A direction and speed
# Speed can be a positive or negative integer in the range of -65535 to 65535
# Positive values spin the motor forward, negative values spin it backward, and zero stops the motor.
def spin_right_motor(speed):
    if speed > 0:  # If speed is positive, spin forward
        motorAIN1.value(1)  # Set motor A input 1 high
        motorAIN2.value(0)  # Set motor A input 2 low
    elif speed < 0:  # If speed is negative, spin backward
        motorAIN1.value(0)  # Set motor A input 1 low
        motorAIN2.value(1)  # Set motor A input 2 high
    else:  # If speed is zero, stop the motor
        motorAIN1.value(0)
        motorAIN2.value(0)
    
    # We've already taken care of the negative or positive speed by setting the direction of the motor
    # Now we just need to set the PWM duty cycle based on the absolute value of speed
    speed = abs(speed)  # Use the absolute value of speed for PWM duty cycle

    # In functions where we allow users to pass their own arguments (in this case speed),
    # we need to make sure that what they have set is within the allowed range for 
    # our hardware otherwise unexpected things might happen. In our case, PWM duty cycle must be 
    # between 0 and 65535 so we'll check that here and make sure it is within that range:
    if speed > 65535:
        print("Speed exceeds maximum limit, setting to maximum allowed speed.")
        speed = 65535

    motorAPWM.duty_u16(speed)  # Set the PWM duty cycle to the absolute value of speed

# Function to set motor B direction and speed
def spin_left_motor(speed):
    if speed > 0:  # If speed is positive, spin forward
        motorBIN1.value(1)  # Set motor B input 1 high
        motorBIN2.value(0)  # Set motor B input 2 low
    elif speed < 0:  # If speed is negative, spin backward
        motorBIN1.value(0)  # Set motor B input 1 low
        motorBIN2.value(1)  # Set motor B input 2 high
    else:  # If speed is zero, stop the motor
        motorBIN1.value(0)
        motorBIN2.value(0)

    speed = abs(speed)  # Use the absolute value of speed for PWM duty cycle

    if speed > 65535:
        print("Speed exceeds maximum limit, setting to maximum allowed speed.")
        speed = 65535

    motorBPWM.duty_u16(speed)  # Set the PWM duty cycle to the absolute value of speed.

from time import sleep # Import sleep function to add delays

# Feel free to change this speed value to test running the motor at different speeds!
speed = 30000  # Example speed value to test the motor (should be between -65535 and 65535)
turnCalibration = 0 # Calibration value for tuning how much faster we drive one motor than the other when turning

def forward(distance):
    spin_right_motor(speed)  # Spin right motor forward
    spin_left_motor(speed)   # Spin left motor forward
    sleep(driveTime * 0.001 * distance)
    spin_right_motor(0)  # Stop right motor
    spin_left_motor(0)   # Stop left motor

def backward(distance):
    spin_right_motor(-speed)  # Spin right motor backward
    spin_left_motor(-speed)   # Spin left motor backward
    sleep(driveTime * 0.001 * distance)
    spin_right_motor(0)  # Stop right motor
    spin_left_motor(0)   # Stop left motor

def right(distance):
    spin_right_motor(speed + turnCalibration)  # Spin right motor forward with calibration
    spin_left_motor(-speed)  # Spin left motor backward
    sleep(turnTime * 0.001 * distance)
    spin_right_motor(0)  # Stop right motor
    spin_left_motor(0)   # Stop left motor

def left(distance):
    spin_right_motor(-speed)  # Spin right motor backward
    spin_left_motor(speed + turnCalibration)  # Spin left motor forward with calibration
    sleep(turnTime * 0.001 * distance)
    spin_right_motor(0)  # Stop right motor
    spin_left_motor(0)   # Stop left motor

def drive(inputString):
    # Breaking up a string into usable parts is called "parsing"
    # We can use the split function to break up a string into a list of words
    inputList = inputString.split()  # Split the input string into a list of words
    # the first word is the direction and the second is the distance
    if len(inputList) < 2:  # Check if there are at least two words in the input
        print("Invalid input. Please provide a direction and a distance.")
        return

    direction = inputList[0].lower()  # Get the first word and convert it to lowercase (so we can accept 'f' or 'F')
    distance = int(inputList[1])  # Get the second word and convert it to an integer

    # check the switch state and only drive if the switch is pressed
    if switchPin.value() == 1:  # If the switch is in OFF position
        print("Switch is in the OFF position. Cannot drive.")
        return # Notice how we can use "return" to exit the function early if we don't want to do anything
    
    # Go in the direction specified by the user by using our motor functions
    if direction == 'f':
        forward(distance)
    elif direction == 'b':
        backward(distance)
    elif direction == 'r':
        right(distance)
    elif direction == 'l':
        left(distance)
    else:
        print("Invalid direction. Please use 'f' for forward, 'b' for backward, 'r' for right, or 'l' for left.")

# TODO: for these standalone source files, we might want to do this via input() or something since users aren't running individual Jupyter cells...

# Single test of the drive function:
drive("f 10")  # Example test to drive forward 10 units
# You can call the drive function with different inputs to test the robot's movement

# Test of delivering multiple commands to the robot in a "for" loop:
commands = [
    "f 5",  # Drive forward 5 units
    "r 90",  # Turn right 90 units
    "b 3",  # Drive backward 3 units
    "l 45",  # Turn left 45 units
    "f 10"   # Drive forward 10 units
]

for c in commands:
    print("Executing command:", c)
    drive(c)  # Execute each command in the list
    sleep(1)  # Add a delay between commands to see what's happening more clearly

# TIP: If you want the robot running these commands until you stop it manually, put the for loop inside a while loop like below:
# while True:
#     for c in commands:
#         print("Executing command:", c)
#         drive(c)  # Execute each command in the list
#         sleep(1)  # Add a delay between commands to see what's happening more clearly
