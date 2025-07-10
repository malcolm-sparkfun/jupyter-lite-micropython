# TODO: Depending on how we want this to look, we may not include this (in case it is in firmware) but for now
# this will get it to work. 
import machine
import math
from time import sleep_us
from machine import time_pulse_us
from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the brightness of our LED


class Servo:
    def __init__(self,pin_id,min_us=544.0,max_us=2400.0,min_deg=0.0,max_deg=180.0,freq=50):
        self.pwm = machine.PWM(machine.Pin(pin_id))
        self.pwm.freq(freq)
        self.current_us = 0.0
        self._slope = (min_us-max_us)/(math.radians(min_deg)-math.radians(max_deg))
        self._offset = min_us
        
    def write(self,deg):
        self.write_rad(math.radians(deg))

    def read(self):
        return math.degrees(self.read_rad())
        
    def write_rad(self,rad):
        self.write_us(rad*self._slope+self._offset)
    
    def read_rad(self):
        return (self.current_us-self._offset)/self._slope
        
    def write_us(self,us):
        self.current_us=us
        self.pwm.duty_ns(int(self.current_us*1000.0))
    
    def read_us(self):
        return self.current_us

    def off(self):
        self.pwm.duty_ns(0)

# LEDs
pwmRed   = PWM(Pin(28), freq=1000, duty_u16=0) # Create a PWM object on pin 28 with a frequency of 1000Hz and an initial "on time" of 0 (off)
pwmBlue  = PWM(Pin(32), freq=1000, duty_u16=0) # Create a PWM object on pin 32 with a frequency of 1000Hz and an initial "on time" of 0 (off)
pwmGreen = PWM(Pin(30), freq=1000, duty_u16=0) # Create a PWM object on pin 30 with a frequency of 1000Hz and an initial "on time" of 0 (off)

# Distance Sensor
trigPin = Pin(20, Pin.OUT) # Create a pin object for the trigger pin (pin 20) and set it as an output
echoPin = Pin(21, Pin.IN) # Create a pin object for the echo pin (pin 21) and set it as an input

# Buzzer
pwmSpeaker  = PWM(Pin(34), freq=0, duty_u16=0) # Create a PWM object on pin 34 with a frequency of 0Hz and an initial "on time" of 0 (off)

# Servo
myServo = Servo(pin_id=35)

from time import sleep_us
from machine import time_pulse_us

def get_distance():
    trigPin.high()
    sleep_us(10) # Send at least a 10 microsecond pulse to the trigger pin to start the measurement
    trigPin.low() # Set the trigger pin low to stop the measurement

    echoTime = time_pulse_us(echoPin, 1)

    calculatedDistance = echoTime / 148.0 #calculate the distance of the object that reflected the pulse (half the bounce time multiplied by the speed of sound)

    return calculatedDistance # Return the calculated distance

from time import sleep

# Infinite loop to read the distance sensor and update the RGB LED colors based on the distance
while True:
    distance = get_distance() # Get the distance from the sensor
    print(f"Distance (in): {distance: 5}", end='\r') # Print our readings (don't mind the fanciness of this line it just makes the print format nicely)

    if distance <= 10:
        # Make the RGB LED red 
        pwmRed.duty_u16(65535)
        pwmGreen.duty_u16(0)
        pwmBlue.duty_u16(0)

        # This code wiggles the servo and beeps the buzzer
        pwmSpeaker.freq(272)            # Buzz the buzzer at 272 Hz
        pwmSpeaker.duty_u16(32768)      # Enable the buzzer at 50% duty cycle
        myServo.write(10)               # Move the servo to 10 degrees
        sleep(0.100)                    # Wait 100 milliseconds

        pwmSpeaker.duty_u16(0)          # Turn off the buzzer
        myServo.write(150)              # Move the servo to 150 degrees
        sleep(0.100)                    # Wait 100 milliseconds

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