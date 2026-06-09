import os
import pika
from dotenv import load_dotenv

load_dotenv()
host = os.getenv("RABBITMQ_HOST")
port = os.getenv("RABBITMQ_PORT")
user = os.getenv("RABBITMQ_USER")
pwd = os.getenv("RABBITMQ_PASS")

# A Connection can have multi-Channel 
# A channel can have multiple Queue/Mailbox

def getConnection():
    return pika.BlockingConnection(
        pika.ConnectionParameters(
            host=host,
            port=int(port),
            credentials=pika.PlainCredentials(user, pwd)
        )
    )

def publish(queue: str, message: str):
    #*--- open connection
    connection = getConnection()
    channel = connection.channel()
    
    try:
        #*--- declare queue
        channel.queue_declare(queue=queue, durable=True)

        #*--- send message
        channel.basic_publish(
            exchange="",
            routing_key=queue,  # which queue to send to
            body=message # bts does .encode() into bytes
        )
    finally:
        #*--- close connection
        connection.close()

def consume(queue: str, callback):
    #*--- open connection & get channel
    connection = getConnection()
    channel = connection.channel()

    #*--- pika contract that needs the param ch, method, prop, body
    # ack stands for aknowledgement btw
    def on_message(ch, method, properties, body):
        # method = "delivery info": queue + delivery tag (aka message ID) 
        callback(body.decode())
        ch.basic_ack(delivery_tag=method.delivery_tag)

    #*--- declare queue
    channel.queue_declare(queue=queue, durable=True)

    #*--- start listening, call callback(message) when something arrives
    channel.basic_consume(queue=queue, on_message_callback=on_message)
    channel.start_consuming()
