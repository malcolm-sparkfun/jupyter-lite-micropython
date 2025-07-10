from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the brightness of our LED

blueKeyPin = Pin(35, Pin.IN, Pin.PULL_UP) # Create a Pin object for the first key on pin 35, set as input with pull-up resistor
greenKeyPin = Pin(33, Pin.IN, Pin.PULL_UP) # Create a Pin object for the first key on pin 33, set as input with pull-up resistor
yellowKeyPin = Pin(32, Pin.IN, Pin.PULL_UP) # Create a Pin object for the second key on pin 32, set as input with pull-up resistor
redKeyPin = Pin(31, Pin.IN, Pin.PULL_UP) # Create a Pin object for the third key on pin 35, set as input with pull-up resistor

blueLedPin = Pin(22, Pin.OUT) # Create a Pin object for the first LED on pin 25, set as output
greenLedPin = Pin(20, Pin.OUT) # Create a Pin object for the second LED on pin 26, set as output
yellowLedPin = Pin(23, Pin.OUT) # Create a Pin object for the third LED on pin 27, set as output
redLedPin = Pin(21, Pin.OUT) # Create a Pin object for the fourth LED on pin 14, set as output

buttons = [blueKeyPin, greenKeyPin, yellowKeyPin, redKeyPin] # Create a list of button pins
leds = [blueLedPin, greenLedPin, yellowLedPin, redLedPin] # Create a list of LED pins
tones = [262, 330, 392, 494] # Define the frequencies for the tones corresponding to the buttons

pwmSpeaker  = PWM(Pin(34), freq=0, duty_u16=0) # Create a PWM object on pin 34 with a frequency of 0Hz and an initial "on time" of 0 (off)

roundsToWin = 10 # Number of rounds needed to win
timeLimit = 2000 # Time limit for each round in milliseconds

from random import randint # Import the randint function to generate random numbers
from time import sleep_ms # Import the sleep_ms function to pause execution for a specified number of milliseconds

# list to store the sequence that the player needs to remember
# we will start with a list of zeros and update it in the start sequence
buttonSequence = [0] * roundsToWin # Note how to initialize a list with a fixed size
gameStarted = False # Global flag to indicate if the game has started

# Flash LED
def flashLed(ledNumber):
    leds[ledNumber].high() # Turn on the LED
    pwmSpeaker.freq(tones[ledNumber]) # Set the frequency of the speaker to the corresponding tone
    pwmSpeaker.duty_u16(32768) # Set the duty cycle to 50% (half brightness)

# Turn all LEDs off
def allLedsOff():
    for led in leds:
        led.low() # Turn off each LED
    pwmSpeaker.duty_u16(0) # Turn off the speaker by setting duty cycle to 0

# Check which button was pressed
def buttonCheck():
    for i in range(len(buttons)):
        if buttons[i].value() == 0:
            return i # Return the "index" of the pressed button
    return 4 # Return 4 if no button is pressed (invalid index)
    
def timedTone(frequency, duration):
    pwmSpeaker.freq(frequency) # Set the frequency of the speaker
    pwmSpeaker.duty_u16(32768) # Set the duty cycle to 50%
    sleep_ms(duration) # Wait for the specified duration
    pwmSpeaker.duty_u16(0) # Turn off the speaker by setting duty cycle to 0

# Start Sequence
def startSequence():
    global buttonSequence # We need the "global" keyword to modify the variable outside this function

    for i in range(roundsToWin): # Loop through the number of rounds and fill up the button sequence
        buttonSequence[i] = randint(0, 3) # Generate a random number between 0 and 3 for the button sequence

    # Flash all of the LEDs 4 times when the game starts
    for i in range(len(tones)):
        # Play one of the tones
        timedTone(tones[i], 200) # Play the tone for 200 milliseconds
        
        # Turn all the LEDs on
        for led in leds:
            led.high()
        
        # Wait for at least 100 milliseconds
        sleep_ms(100)

        # Turn all the LEDs off
        allLedsOff()

        # Wait for at least 100 milliseconds
        sleep_ms(100)

# Win Sequence
def winSequence():
    # Turn all the LEDs on
    for led in leds:
        led.high() # Turn on each LED
    
    # Play the 1Up noise
    timedTone(1318, 150) # Play E6 for 150 milliseconds
    sleep_ms(175)        # Wait for 175 milliseconds
    timedTone(1567, 150) # Play G6 for 150 milliseconds
    sleep_ms(175)        # Wait for 175 milliseconds
    timedTone(2637, 150) # Play E7 for 150 milliseconds
    sleep_ms(175)        # Wait for 175 milliseconds
    timedTone(2093, 150) # Play C7 for 150 milliseconds
    sleep_ms(175)        # Wait for 175 milliseconds
    timedTone(2349, 150) # Play D7 for 150 milliseconds
    sleep_ms(175)        # Wait for 175 milliseconds
    timedTone(3135, 500) # Play G7 for 500 milliseconds
    sleep_ms(500)        # Wait for 500 milliseconds
    
    # Wait until a button is pressed
    pressedButton = 4 # 4 is an invalid index, used to indicate no button pressed
    while pressedButton == 4: # Keep checking until a button is pressed
        pressedButton = buttonCheck()
        sleep_ms(100)
    
    # Reset the game started flag
    global gameStarted # This allows us to modify the variable outside this function
    gameStarted = False # reset the game so that the start sequence will play again.

# Lose Sequence
def loseSequence():
    # Turn all the LEDs on
    for led in leds:
        led.high() # Turn on each LED
    
    # Play the 1Up noise
    timedTone(1318, 250) # Play E6 for 250 milliseconds
    sleep_ms(275)        # Wait for 275 milliseconds
    timedTone(1567, 250) # Play G6 for 250 milliseconds
    sleep_ms(275)        # Wait for 275 milliseconds
    timedTone(2637, 150) # Play E7 for 150 milliseconds
    sleep_ms(175)        # Wait for 175 milliseconds
    timedTone(2093, 500) # Play C7 for 500 milliseconds
    sleep_ms(500)        # Wait for 500 milliseconds
    
    # Wait until a button is pressed
    pressedButton = 4 # 4 is an invalid index, used to indicate no button pressed
    while pressedButton == 4: # Keep checking until a button is pressed
        pressedButton = buttonCheck()
        sleep_ms(100)
    
    # Reset the game started flag
    global gameStarted # This allows us to modify the variable outside this function
    gameStarted = False # reset the game so that the start sequence will play again.

from time import ticks_ms # Import the ticks_ms function to get the current time in milliseconds
from time import ticks_diff # Import the ticks_diff function to calculate the difference between two times

# Variable to keep track of the current round
roundCounter = 0

# Infinite loop to keep the program running
while True:
    if not gameStarted: # If the game has not started
        startSequence() # Start the game sequence
        roundCounter = 0
        sleep_ms(1500)
        gameStarted = True
    
    # each round, start by flashing out the sequence to be repeated
    for i in range(roundCounter + 1): # Go through the array up to the current round number
        flashLed(buttonSequence[i]) # Turn on the LED for that array position and play the sound
        sleep_ms(200) # Wait
        allLedsOff() # Turn all of the LEDs off
        sleep_ms(200)

    # then start going through the sequence one at a time and see if the user presses the correct button
    for i in range(roundCounter + 1): # For each button to be pressed in the sequence
        startTime = ticks_ms() # Record the start time

        while gameStarted: # Loop until the player presses a button or the time limit is up
            pressedButton = buttonCheck() # Every loop check to see which button is pressed

            if pressedButton < 4: # If a button is pressed (4 means that no button is pressed)
                flashLed(pressedButton) # Flash the LED for the button that was pressed

                if pressedButton == buttonSequence[i]: # If the button matches the button in the sequence
                    sleep_ms(250) # Leave the LED light on for a moment
                    allLedsOff() # Then turn off all of the lights
                    break # End the while loop (this will go to the next number in the for loop)
                else: # If the button doesn't match the button in the sequence
                    loseSequence() # Play the lose sequence (the lose sequence stops the program)
                    break # When the program gets back from the lose sequence, break the while loop so that the game can start over
            else: # If no button is pressed
                allLedsOff() # Turn all the LEDs off

            # Check to see if the time limit is up
            endTime = ticks_ms()
            timePassed = ticks_diff(endTime, startTime) # Calculate the time passed since the start
            if timePassed > timeLimit: # If the time limit is up
                loseSequence() # Play the lose sequence
                break # When the program gets back from the lose sequence, break the while loop so that the game can start over

    if gameStarted: # If the game is still running
        roundCounter += 1 # Increase the round number by 1

        if roundCounter >= roundsToWin: # If the player has gotten to the final round
            winSequence()
        
        sleep_ms(500) # Wait for half a second between rounds


