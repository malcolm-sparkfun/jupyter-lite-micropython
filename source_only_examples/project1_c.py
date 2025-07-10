from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board

from machine import ADC # Allows us to use "ADC" (analog-to-digital conversion) to read from our analog pin

led_pin = Pin(34, Pin.OUT) # Create a pin variable for the led pin (pin 34)
photoresistor = ADC(Pin.board.A0) # Create an ADC variable for reading the photoresistor value from analog pin A0

# Try moving the potentiometer and re-running this cell and you should see this value change.
print(photoresistor.read_u16()) # Use the "read_u16" method to read the value of our potentiometer.

# Now, let's turn the LED on and off based on the photoresistor value.
import time # Allows us to use "time.sleep()" to delay for a certain number of seconds

# We'll set our threshold to half of the maximum value of the ADC reading (65535)
threshold = 65535 / 2 

# Infinite loop so this cell keeps running until we stop it.
while True:
    photoValue = photoresistor.read_u16() # Get the new photoresistor value (0 - 65535)

    print(f"Photoresistor Value: {photoValue : 5}", end='\r') # Print our Photoresistor reading (don't mind the fanciness of this line it just makes the print format nicely)

    # Turn on the LED but only if the photoresistor value is above the threshold
    if photoValue > threshold:
        led_pin.high()
    else:
        led_pin.low()

    # A short delay to make the printout easier to read
    time.sleep(0.250)

