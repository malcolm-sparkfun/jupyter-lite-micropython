from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the speed of our motors

# Motor A control pins
motorAIN1 = Pin(31, Pin.OUT) # Control pin for motor A input 1
motorAIN2 = Pin(32, Pin.OUT) # Control pin for motor A input 2

motorAPWM =  PWM(Pin(33), freq=490, duty_u16=0) # PWM pin for motor A with frequency of 1000 Hz and initial duty cycle (on time) of 0

# Motor B control pins (commenting out until next circuit)
# motorBIN1 = Pin(21, Pin.OUT) # Control pin for motor B input 1
# motorBIN2 = Pin(35, Pin.OUT) # Control pin for motor B input 2
# motorBPWM = PWM(Pin(34), freq=1000, duty_u16=0) # PWM pin for motor B with frequency of 1000 Hz and initial duty cycle (on time) of 0

# Switch pin
switchPin = Pin(28, Pin.IN, Pin.PULL_UP)  # Switch pin with pull-up resistor

# Function to set motor A direction and speed
# Speed can be a positive or negative integer in the range of -65535 to 65535
# Positive values spin the motor forward, negative values spin it backward, and zero stops the motor.
def spin_motor(speed):
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

# Feel free to change this speed value to test running the motor at different speeds!
speed = 30000  # Example speed value to test the motor (should be between -65535 and 65535)

# infinite loop to keep the program running
while True:
    if switchPin.value() == 0:  # Check if the switch is pressed (active low)
        spin_motor(speed)  # Spin the motor at the specified speed
    else:
        spin_motor(0)  # Stop the motor if the switch is not pressed