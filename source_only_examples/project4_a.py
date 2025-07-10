# The qwiic_oled driver module allows for control of SparkFun OLEDs.
# The QwiicLargeOled class is for the Large 1.3" OLED display in our SIK
from qwiic_oled import QwiicLargeOled

# Define the OLED object that we will use
# Note how we don't have to provide the pins, the driver automatically selects the pins for the qwiic connector
myOLED = QwiicLargeOled()

myOLED.begin() # Initialize the OLED

# Clear the OLED
myOLED.clear(myOLED.ALL) # Clear OLED graphic memory.
myOLED.clear(myOLED.PAGE) # Clear the processor's display buffer.

myOLED.print("Hello World!") # Print a message to the OLED
myOLED.display() # Display the message on the OLED (this function must be called to actually show the text)