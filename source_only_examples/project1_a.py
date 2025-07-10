from machine import Pin

led_pin = Pin(34, Pin.OUT)
led_pin.high()
led_pin.low()

from time import sleep
led_pin.high()
sleep(1)
led_pin.low()
sleep(1)
led_pin.high()
sleep(1)
led_pin.low()

for i in range(10):
    led_pin.high()
    sleep(1)
    led_pin.low()
    sleep(1)
