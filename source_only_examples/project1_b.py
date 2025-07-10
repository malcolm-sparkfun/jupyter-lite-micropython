from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board

from machine import ADC # Allows us to use "ADC" (analog-to-digital conversion) to read from our analog pin

led_pin = Pin(34, Pin.OUT) # Create a pin variable for the led pin (pin 34)
potentiometer = ADC(Pin.board.A0) # Create an ADC variable for reading the potentiometer value from analog pin A0

# Try moving the potentiometer and re-running this cell and you should see this value change.
print(potentiometer.read_u16()) # Use the "read_u16" method to read the value of our potentiometer.

# Now, let's blink the LED with different speeds based on the potentiometer input
import time # Allows us to use "time.sleep()" to delay for a certain number of seconds

# Infinite loop so this cell keeps running until we stop it.
while True:
    potPosition = potentiometer.read_u16() # Get the new potentiometer position (0 - 65535)

    # Lets choose a delay that is proportional to the potentiometer reading
    # Since the range of the potentiometer is 0-65535 and we want delays between 0-2 seconds, 
    # we will divide by (65535 / 2 ) = 32767.5
    delay = (potPosition / 32767.5) 

    # We will comment out the print for now since it can spam our console when the delay is fairly low
    # print(f"Potentiometer Value: {potPosition : 5}", end='\r') # Print our potentiometer reading (don't mind the fanciness of this line it just makes the print format nicely)

    # Turn on the LED
    led_pin.high()

    # Delay based on potentiometer position
    time.sleep(delay)
    
    # Turn off the LED
    led_pin.low()
    
    # Delay based on potentiometer position
    time.sleep(delay)