from machine import Pin # Allows us to use "Pin" to use code to interface with the pins on our board
from machine import PWM # Allows us to use "PWM" (pulse-width modulation) to control the brightness of our LED

pwmSpeaker  = PWM(Pin(34), freq=0, duty_u16=0) # Create a PWM object on pin 34 with a frequency of 0Hz and an initial "on time" of 0 (off)

from time import sleep # Import the sleep function to pause execution for a specified duration
beatLength = 0.25 # Define the length of a beat in seconds (0.5 seconds). Change this to adjust the tempo of the music.
restLength = 0.05 # Define the length of a rest in seconds (0.25 seconds). Change this to adjust the length of pauses in the music.

def play(note, beats):
    # To define a list we put it in square brackets []
    # These list is used to look up the frequency of each note
    notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b', 'C', 'D', 'E', 'F', 'G', 'A', 'B', ' ']
    # This list contains the frequencies corresponding to the notes in the "notes" list
    # For example the 4th item in the "notes" list is 'f' and the 4th item in the "frequencies" list is 175Hz, its frequency
    frequencies = [131, 147, 165, 175, 196, 220, 247, 262, 294, 330, 349, 392, 440, 494, 0]
    
    # We will now search our lists for a match
    frequency = 0 

    # This loop will step through each note in the "notes" list and look for a match with the "note" variable
    # Notice the len(notes) function returns the number of items in the "notes" list
    # The range function creates a sequence of numbers from 0 to len(notes) - 1
    # The "for" loop will repeat for each number in that sequence
    for i in range(len(notes)):
        if notes[i] == note:  # If the note matches the current note in the list
            frequency = frequencies[i]  # Get the corresponding frequency
    
    pwmSpeaker.freq(frequency)   # Set the frequency of the PWM signal to the specified frequency
    if frequency == 0: # If the frequency is 0, it means we are playing a rest (no sound)
        pwmSpeaker.duty_u16(0)  # Set the duty cycle to 0 (off)
    else:  # If the frequency is not 0, we are playing a note
        pwmSpeaker.duty_u16(32768)   # Set the duty cycle to 50% on time (half as loud as possible)
    sleep(beats * beatLength)    # Wait for the specified number of beats (0.5 seconds per beat)
    pwmSpeaker.duty_u16(0)       # Turn off the speaker by setting duty cycle to 0
    sleep(beats * restLength)  # Wait for the specified number of rests (0.25 seconds per rest)

# Happy Birthday melody using the play() function
play('g', 2)    # ha
play('g', 1)    # ppy
play('a', 4)    # birth
play('g', 4)    # day
play('C', 4)    # to
play('b', 4)    # you

play(' ', 2)    # pause for 2 beats

play('g', 2)    # ha
play('g', 1)    # ppy
play('a', 4)    # birth
play('g', 4)    # day
play('D', 4)    # to
play('C', 4)    # you

play(' ', 2)    # pause for 2 beats

play('g', 2)    # ha
play('g', 1)    # ppy
play('G', 4)    # birth
play('E', 4)    # day
play('C', 4)    # dear
play('b', 4)    # your
play('a', 6)    # name

play(' ', 2)    # pause for 2 beats

play('F', 2)    # ha
play('F', 1)    # ppy
play('E', 4)    # birth
play('C', 4)    # day
play('D', 4)    # to
play('C', 6)    # you

