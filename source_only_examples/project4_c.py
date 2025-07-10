# Copy this file to a file called "boot.py" in the root directory of your filesystem to run this on boot!

# The qwiic_oled driver module allows for control of SparkFun OLEDs.
# The QwiicLargeOled class is for the Large 1.3" OLED display in our SIK
from qwiic_oled import QwiicLargeOled
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the brightness of our LED
from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from time import sleep_ms # Import the sleep_ms function to pause execution for a specified number of milliseconds
from random import randint # Import the randint function to generate random integers
from time import ticks_ms # function to get the current time in milliseconds

# Define the OLED object that we will use
# Note how we don't have to provide the pins, the driver automatically selects the pins for the qwiic connector
myOLED = QwiicLargeOled()

# Create a PWM object on pin 34 with a frequency of 0Hz and an initial "on time" of 0 (off)
pwmSpeaker  = PWM(Pin(34), freq=0, duty_u16=0)

# Create a Pin object for the button on pin 33, set as input with pull-up resistor
buttonPin = Pin(33, Pin.IN, Pin.PULL_UP) 

# Function for playing a timed tone from the speaker (buzzer)
def timed_tone(frequency, duration):
    pwmSpeaker.freq(frequency) # Set the frequency of the speaker
    pwmSpeaker.duty_u16(32768) # Set the duty cycle to 50%
    sleep_ms(duration) # Wait for the specified duration
    pwmSpeaker.duty_u16(0) # Turn off the speaker by setting duty cycle to 0

words = [ "moose", "beaver", "bear", "goose", "dog", "cat", "squirrel", "bird", "elephant", "horse",
          "bull", "giraffe", "seal", "bat", "skunk", "turtle", "whale", "rhino", "lion", "monkey",
          "frog", "alligator", "kangaroo", "hippo", "rabbit" ]

# Create a list of 25 elements to store the order to display the words
# This will store indices into the words list, which will be used to display the words in a random order.
# We will initialize the list with -1 (which is an invalid index) until we have 
# created the random order of words with our generate_random_order() function
# If you change the number of words in the words list, you will need to change the size of this list as well.
orderOfWords = [-1, -1, -1, -1, -1, -1, -1, -1,
                -1, -1, -1, -1, -1, -1, -1, -1,
                -1, -1, -1, -1, -1, -1, -1, -1, -1]

# Pro Tip: The above list could also be created in a more compact way by...
#
# using "list comprehension":
# orderOfWords = [-1 for _ in range(len(words))] 
#
# OR using "list initialization":
# orderOfWords = [-1] * len(words)

timeLimit = 15000 # Time limit for each word in milliseconds (15 seconds)
roundNumber = 0 # Keeps track of the current round number so it can be displayed on the OLED

# Function to generate a random order of words
def generate_random_order():
    for i in range(len(orderOfWords)):
        # Generate a random index from 0 to the length of the words list
        random_index = randint(0, len(words) - 1)
        
        # Keep generating a new random index until we find one that is not already in the orderOfWords list
        # This ensures that each word will be used exactly once in the order
        while random_index in orderOfWords:
            random_index = randint(0, len(words) - 1)
        
        # Assign the random index to the orderOfWords list
        orderOfWords[i] = random_index

# Function to fully clear the OLED display
def clear_all_oled():
    myOLED.clear(myOLED.ALL) # Clear OLED graphic memory.
    myOLED.clear(myOLED.PAGE) # Clear the processor's display buffer.

def show_start_sequence():
    myOLED.set_font_type(1) # Set our font to font #1 (medium sized letters and numbers)
    clear_all_oled()  # Clear the OLED display
    myOLED.set_cursor(0, 0)  # Move the cursor to the top left corner
    myOLED.print("Category:")  # Print "Category:"
    myOLED.display() # Actually show what we've printed
    
    myOLED.set_cursor(0, 50)  # Move the cursor to the bottom left corner
    myOLED.print("Animals")  # Print "Animals"
    myOLED.display() # Actually show what we've printed
    
    sleep_ms(2000)  # Wait for 2 seconds
    
    clear_all_oled()  # Clear the display
    myOLED.set_cursor(20, 25)  # Move the cursor to middle(ish) of the screen
    myOLED.print("Get ready!")  # Print "Get ready!"
    myOLED.display() # Actually show what we've printed
    sleep_ms(1000)  # Wait for 1 second

    # Let's make our countdown nice and big by using font #3 (Large Number Font)
    myOLED.set_font_type(3)
    
    # Pro Tip: You can count DOWN with a for loop by passing -1 to the range function
    # This will count from 3 to 1, decreasing by 1 each time
    for i in range(3, 0, -1):  # Countdown from 3 to 1
        clear_all_oled()  # Clear the display
        myOLED.set_cursor(60, 10)  # Move the cursor to middle(ish) of the screen
        myOLED.print(str(i))  # Print the countdown number
        myOLED.display() # Actually show what we've printed
        sleep_ms(1000)  # Wait for 1 second

    # # Set our font back to font #1 (medium sized letters and numbers) after the countdown
    myOLED.set_font_type(1)

# Function to display when the player loses
def game_over():
    clear_all_oled()  # Clear the OLED display
    myOLED.set_cursor(0, 0)  # Move the cursor to the top left corner
    myOLED.print("Game Over")  # Print "Game Over"
    
    myOLED.set_cursor(0, 50)  # Move to the bottom row
    myOLED.print("Score: ")  # Print a label for the score
    myOLED.print(roundNumber - 1)  # Print the score (the score is equal to the previous level/round number)
    myOLED.display() # Actually show what we've printed
    
    # Play the losing fog horn
    timed_tone(130, 250)  # E6
    sleep_ms(275)
    timed_tone(73, 250)   # G6
    sleep_ms(275)
    timed_tone(65, 150)   # E7
    sleep_ms(175)
    timed_tone(98, 500)   # C7
    sleep_ms(500)

# Function to display when the player wins
def winner():
    clear_all_oled()  # Clear the OLED display
    myOLED.set_cursor(50, 20)  # Move the cursor to the top center of the screen
    myOLED.print("YOU")  # Print "You"
    
    myOLED.set_cursor(50, 40)  # Move to the bottom center of the screen
    myOLED.print("WIN!")  # Print "WIN!"
    myOLED.display() # Actually show what we've printed
    
    # Play the winning sound
    timed_tone(1318, 150)  # E6
    sleep_ms(175)
    timed_tone(1567, 150)  # G6
    sleep_ms(175)
    timed_tone(2637, 150)  # E7
    sleep_ms(175)
    timed_tone(2093, 150)  # C7
    sleep_ms(175)
    timed_tone(2349, 150)  # D7
    sleep_ms(175)
    timed_tone(3135, 500)  # G7
    sleep_ms(500)

# Now let's actually run the game!
# Initialize the OLED display
myOLED.begin()  # Initialize the OLED display

generate_random_order()  # Generate a random order of words
show_start_sequence()  # Show the start sequence on the OLED display

print("Starting Program!")

# Variable for keeping track if the player has lost yet
playerHasLost = False 

for i in range(len(orderOfWords)):
    clear_all_oled()  # Clear the OLED display

    myOLED.set_cursor(0, 25)  # Move the cursor to the start of the middle(ish) row of the screen
    roundNumber = i + 1 # the array starts at 0, but the roundNumber will start counting from 1
    myOLED.print(str(roundNumber) + ": ")  # Print the current round number
    myOLED.print(words[orderOfWords[i]])  # Print the word from the random order list
    myOLED.display() # Actually show what we've printed

    startTime = ticks_ms()  # Get the current time in milliseconds
    
    # Loop until the button is pressed
    while buttonPin.value() == 1:  # Wait for the button to be pressed
        roundedTimeLeft = int((timeLimit - (ticks_ms() - startTime)) / 1000)  # Calculate the remaining time in seconds

        # Display the time left in the lower right corner of the OLED
        myOLED.set_cursor(110, 50)

        myOLED.print("  ")  # Clear the previous time display
        myOLED.set_cursor(110, 50)
        myOLED.print(str(roundedTimeLeft))
        myOLED.display() # Actually show what we've printed
        sleep_ms(15)

        # Check if the time limit has been exceeded
        if ticks_ms() - startTime > timeLimit:
            playerHasLost = True # Player has failed to meet the time limit so let's take note of that so we know to play the failure sequence
            break # Break Out of our while loop
        
        # If the button was pressed, we will play a short beep sound
        if buttonPin.value() == 0:
            timed_tone(272, 30)

    # If the player has lost, let's not show them the other words, and break out of our for loop
    if playerHasLost == True:
        game_over() # Show the game over message
        break # Break out of our "for" loop

    sleep_ms(500) # Wait for half a second to "debounce" the button press

# If we reach here and the whole for loop has completed without saying the player has lost,
# let's play their victory sequence
if playerHasLost == False:
    winner()  # Display the winning message