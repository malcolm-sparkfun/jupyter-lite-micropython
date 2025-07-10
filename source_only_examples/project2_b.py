from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the brightness of our LED

firstKeyPin = Pin(33, Pin.IN, Pin.PULL_UP) # Create a Pin object for the first key on pin 33, set as input with pull-up resistor
secondKeyPin = Pin(32, Pin.IN, Pin.PULL_UP) # Create a Pin object for the second key on pin 32, set as input with pull-up resistor
thirdKeyPin = Pin(31, Pin.IN, Pin.PULL_UP) # Create a Pin object for the third key on pin 35, set as input with pull-up resistor

pwmSpeaker  = PWM(Pin(34), freq=0, duty_u16=0) # Create a PWM object on pin 34 with a frequency of 0Hz and an initial "on time" of 0 (off)

# In an infinite loop, we will check the state of the keys and play a note when a key is pressed
while True:
    if firstKeyPin.value() == 0: # If the first key is pressed (value is low)
        pwmSpeaker.freq(262) # Play the note C (262Hz)
        pwmSpeaker.duty_u16(32768) # Set the duty cycle to 50% (half as loud as possible)
    elif secondKeyPin.value() == 0: # If the second key is pressed (value is low)
        pwmSpeaker.freq(330) # Play the note E (330Hz)
        pwmSpeaker.duty_u16(32768) # Set the duty cycle to 50% (half as loud as possible)
    elif thirdKeyPin.value() == 0: # If the third key is pressed (value is low)
        pwmSpeaker.freq(392) # Play the note G (392Hz)
        pwmSpeaker.duty_u16(32768) # Set the duty cycle to 50% (half as loud as possible)
    else: # If no key is pressed
        pwmSpeaker.freq(0)
        pwmSpeaker.duty_u16(0) # turn off the speaker    

# Frequency Table: Feel free to change the frequencies for each button press to play different notes.
# note  frequency
# c     262 Hz
# d     294 Hz
# e     330 Hz
# f     349 Hz
# g     392 Hz
# a     440 Hz
# b     494 Hz
# C     523 Hz