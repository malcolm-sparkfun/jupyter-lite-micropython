from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board

from machine import ADC # Allows us to use "ADC" (analog-to-digital conversion) to read from our analog pin

from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the brightness of our LED

import time # Import the time module to use sleep for delays

pwmBlue  = PWM(Pin(32), freq=1000, duty_u16=0) # Create a PWM object on pin 28 with a frequency of 1000Hz and an initial "on time" of 0 (off)
pwmGreen = PWM(Pin(30), freq=1000, duty_u16=0) # Create a PWM object on pin 27 with a frequency of 1000Hz and an initial "on time" of 0 (off)
pwmRed   = PWM(Pin(28), freq=1000, duty_u16=0) # Create a PWM object on pin 26 with a frequency of 1000Hz and an initial "on time" of 0 (off)

# Let's create functions for various colors that we can call later

# Since our PWM "on time" or duty cycle is 16 bits, it is a value between 0 and 65535.
# It's useful to store a variable for maximum brightness so we can use percentages of it easily.
kMaximumBrightness = 65535  # Maximum brightness value for PWM

# These are "functions" that we can "call" to set the color of the LED.
# Notice the "def" keyword, which is used to define a function in Python.
# Now, we can call these later by just typing their names like `red()`, `green()`, etc.
# And all the code inside the function will run.

def red():
    # The "duty_u16" method sets the duty cycle or "on time" for the PWM pin.
    pwmRed.duty_u16(kMaximumBrightness)  # Set the red LED to full brightness
    pwmGreen.duty_u16(0)    # Turn off the green LED
    pwmBlue.duty_u16(0)     # Turn off the blue LED

def orange():
    pwmRed.duty_u16(kMaximumBrightness)  # Set the red LED to full brightness
    pwmGreen.duty_u16(int(kMaximumBrightness * 0.25))  # Set the green LED to quarter brightness (by multiplying by 0.5)
    pwmBlue.duty_u16(0)     # Turn off the blue LED

def yellow():
    pwmRed.duty_u16(kMaximumBrightness)  # Set the red LED to full brightness
    pwmGreen.duty_u16(kMaximumBrightness)  # Set the green LED to full brightness
    pwmBlue.duty_u16(0)     # Turn off the blue LED

def green():
    pwmRed.duty_u16(0)      # Turn off the red LED
    pwmGreen.duty_u16(kMaximumBrightness)  # Set the green LED to full brightness
    pwmBlue.duty_u16(0)     # Turn off the blue LED

def cyan():
    pwmRed.duty_u16(0)      # Turn off the red LED
    pwmGreen.duty_u16(kMaximumBrightness)  # Set the green LED to full brightness
    pwmBlue.duty_u16(kMaximumBrightness)  # Set the blue LED to full brightness

def blue():
    pwmRed.duty_u16(0)      # Turn off the red LED
    pwmGreen.duty_u16(0)    # Turn off the green LED
    pwmBlue.duty_u16(kMaximumBrightness)  # Set the blue LED to full brightness

def magenta():
    pwmRed.duty_u16(kMaximumBrightness)  # Set the red LED to full brightness
    pwmGreen.duty_u16(0)    # Turn off the green LED
    pwmBlue.duty_u16(kMaximumBrightness)  # Set the blue LED to full brightness

def turnOff():
    pwmRed.duty_u16(0)      # Turn off the red LED
    pwmGreen.duty_u16(0)    # Turn off the green LED
    pwmBlue.duty_u16(0)     # Turn off the blue LED


# Remember, we've already defined our RGB pins and functions above. 
# Make sure you have run the cells above this one first!!!
photoresistor = ADC(Pin.board.A0) # Create an ADC variable for reading the photoresistor value from analog pin A0
potentiometer = ADC(Pin.board.A1) # Create an ADC variable for reading the potentiometer value from analog pin A1

# We'll set our photo-resistor threshold to a quarter of the maximum value of the ADC reading (65535)
threshold = 65535 / 4
potentiometerMax = 65535  # Maximum value for the potentiometer reading 

# Infinite loop to continously read the photoresistor and potentiometer values
while True:
    photoValue = photoresistor.read_u16()  # Read the photoresistor value (0 to 65535)
    potPosition = potentiometer.read_u16()  # Read the potentiometer value (0 to 65535)
    # Print the values to the console
    print(f"Photoresistor Value: {photoValue: 5}, Potentiometer Value: {potPosition : 5}", end='\r') # Print our readings (don't mind the fanciness of this line it just makes the print format nicely)

    # Check if the photoresistor value is below the threshold
    if photoValue < threshold:
        # If the photoresistor value is below the threshold, set the LED color based on the potentiometer position
        # Let's split the range 0 - 65535 into 7 equal(ish) parts for different colors
        if potPosition > 0 and potPosition < 9362: 
            red()
        if potPosition >= 9362 and potPosition < 18725: 
            orange()
        if potPosition >= 18725 and potPosition < 28087:
            yellow()
        if potPosition >= 28087 and potPosition < 37450:
            green()
        if potPosition >= 37450 and potPosition < 46812:
            cyan()
        if potPosition >= 46812 and potPosition < 56175:
            blue()
        if potPosition >= 56175 and potPosition <= 65535:
            magenta()

    else: # Note that this "else" aligns with the photovalue < Threshold condition above.
        turnOff()  # Turn off the LED if the photoresistor value is above the threshold
    
    time.sleep(0.250)  # Sleep for 0.25 seconds to avoid flooding the console with prints
