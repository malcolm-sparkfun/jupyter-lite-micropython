# Copy this file to a file called "boot.py" in the root directory of your filesystem to run this on boot!

from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the speed of our motors
from machine import time_pulse_us
from time import sleep # Import sleep functions to add delays
from time import sleep_us # Import sleep_us to add microsecond delays

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

trigPin = Pin(22, Pin.OUT) # Create a pin object for the trigger pin (pin 20) and set it as an output
echoPin = Pin(20, Pin.IN) # Create a pin object for the echo pin (pin 21) and set it as an input

# This is the number of milliseconds that it takes the robot to drive 1 inch
# it is set so that if you tell the robot to drive forward 25 units, the robot drives about 25 inches
driveTime = 125

# this is the number of milliseconds that it takes to turn the robot 1 degree
# it is set so that if you tell the robot to turn right 90 units, the robot turns about 90 degrees
turnTime = 10

backupInches = 10 # Number of inches to back up when the robot detects an obstacle
turnDegrees = 90 # Number of degrees to turn when the robot detects an obstacle

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

    motorBPWM.duty_u16(speed)  # Set the PWM duty cycle to the absolute value of speed

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

def stop():
    spin_right_motor(0)  # Stop right motor
    spin_left_motor(0)   # Stop left motor

def get_distance():
    trigPin.high()
    sleep_us(10) # Send at least a 10 microsecond pulse to the trigger pin to start the measurement
    trigPin.low() # Set the trigger pin low to stop the measurement

    echoTime = time_pulse_us(echoPin, 1)

    calculatedDistance = echoTime / 148.0 #calculate the distance of the object that reflected the pulse (half the bounce time multiplied by the speed of sound)

    return calculatedDistance # Return the calculated distance


# Now let's use all of the above functions to make the robot drive forward until it detects an obstacle

while True:
    # Check if the switch is pressed
    if switchPin.value() == 0:  # If the switch is pressed (active low)
        print("Switch pressed, starting robot movement...")
        spin_right_motor(speed)
        spin_left_motor(speed)
        distance = get_distance()  # Get the distance to the nearest obstacle

        if distance < 10:  # If an obstacle is detected 
            print("Obstacle detected! Backing up and turning...")
            stop() # Stop for a moment
            sleep(0.200)
            backward(backupInches)  # Back up a bit
            right(turnDegrees)  # Turn right
        else:
            # print("No obstacles detected, continuing forward...")
            spin_right_motor(speed)
            spin_left_motor(speed)
    else:
        print("Switch not pressed, stopping robot movement.")
        stop()
    
    sleep(0.050)  # Add a small delay between measurements

