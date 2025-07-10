from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the brightness of our LED
from time import sleep_us, sleep
from machine import time_pulse_us

pwmBlue  = PWM(Pin(32), freq=1000, duty_u16=0) # Create a PWM object on pin 28 with a frequency of 1000Hz and an initial "on time" of 0 (off)
pwmGreen = PWM(Pin(30), freq=1000, duty_u16=0) # Create a PWM object on pin 27 with a frequency of 1000Hz and an initial "on time" of 0 (off)
pwmRed   = PWM(Pin(28), freq=1000, duty_u16=0) # Create a PWM object on pin 26 with a frequency of 1000Hz and an initial "on time" of 0 (off)

trigPin = Pin(20, Pin.OUT) # Create a pin object for the trigger pin (pin 20) and set it as an output
echoPin = Pin(21, Pin.IN) # Create a pin object for the echo pin (pin 21) and set it as an input

def get_distance():
    trigPin.high()
    sleep_us(10) # Send at least a 10 microsecond pulse to the trigger pin to start the measurement
    trigPin.low() # Set the trigger pin low to stop the measurement

    echoTime = time_pulse_us(echoPin, 1)

    calculatedDistance = echoTime / 148.0 #calculate the distance of the object that reflected the pulse (half the bounce time multiplied by the speed of sound)

    return calculatedDistance # Return the calculated distance

# Infinite loop to read the distance sensor and update the RGB LED colors based on the distance
while True:
    distance = get_distance() # Get the distance from the sensor
    print(f"Distance (in): {distance: 5}", end='\r') # Print our readings (don't mind the fanciness of this line it just makes the print format nicely)

    if distance <= 10:
        # Make the RGB LED red 
        pwmRed.duty_u16(65535)
        pwmGreen.duty_u16(0)
        pwmBlue.duty_u16(0)

    elif distance < 20:
        # Make the RGB LED yellow
        pwmRed.duty_u16(65535)
        pwmGreen.duty_u16(32768)
        pwmBlue.duty_u16(0)
    
    else:
        # Make the RGB LED green
        pwmRed.duty_u16(0)
        pwmGreen.duty_u16(65535)
        pwmBlue.duty_u16(0)

    sleep(0.050) # Sleep for 50 ms between each reading