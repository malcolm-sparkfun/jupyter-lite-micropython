# The qwiic_oled driver module allows for control of SparkFun OLEDs.
# The QwiicLargeOled class is for the Large 1.3" OLED display in our SIK
from qwiic_oled import QwiicLargeOled
from machine import ADC # Allows us to use "ADC" (analog-to-digital conversion) to read from our analog pin
from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from time import sleep

# Define the OLED object that we will use
# Note how we don't have to provide the pins, the driver automatically selects the pins for the qwiic connector
myOLED = QwiicLargeOled()

# Create an ADC object for reading the temperature sensor
tempSensor = ADC(Pin.board.A0)  # A0 is the pin we connected the temperature sensor to

def temperatureC():
    voltage = tempSensor.read_u16() * 3.3 / 65535.0 # Convert the raw reading to a voltage (0-5V)
    degreesC = (voltage - 0.5) * 100.0 # Convert the voltage to degrees Celsius
    return degreesC

def temperatureF():
    degreesC = temperatureC() # Get the temperature in Celsius
    degreesF = (degreesC * 9.0 / 5.0) + 32.0 # Convert Celsius to Fahrenheit
    return degreesF


myOLED.begin() # Initialize the OLED

# Infinite loop to continuously read the temperature and display it
while True:
    tempC = temperatureC() # Read the temperature in Celsius
    tempF = temperatureF() # Read the temperature in Fahrenheit

    # Clear the OLED display
    myOLED.clear(myOLED.ALL) # Clear OLED graphic memory.
    myOLED.clear(myOLED.PAGE) # Clear the processor's display buffer.

    # Print the temperature readings to the OLED
    # Print temperature in Celsius
    myOLED.set_cursor(0, 0) # Set cursor to the top-left corner
    myOLED.print(f"Temp C: {tempC:5}") # Print temperature in Celsius (formatted to 5 characters wide)
    myOLED.set_cursor(0, 10) # Move cursor to the next line (down 10 pixels)
    myOLED.print(f"Temp F: {tempF:5}") # Print temperature in Fahrenheit (formatted to 5 characters wide)

    myOLED.display() # Display the updated text on the OLED

    sleep(1) # Wait for 1 second before reading again