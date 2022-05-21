#!/bin/python3
import discord
import json

class AnyBottyClient(discord.Client):
    def __init__(self):
        super(AnyBottyClient, self).__init__()

        self.base_dir = "/<ANYBOTTY_DIR>/"

        self.file_path_dict = {}
        with open(f"{self.base_dir}files.json") as f:
            self.file_path_dict = json.load(f)
        self.help = {}
        with open(f"{self.base_dir}help.json") as f:
            self.help = json.load(f)
        self.messages = {}
        with open(f"{self.base_dir}messages.json") as f:
            self.messages = json.load(f)

    def exit(self):
        exit(0)

    async def on_message(self, message):
        guildId = message.guild.id
        channelId = message.channel.id
        msg = message.content
        sender_username = message.author.name
        if msg.startswith("!ab "):
            msg = msg[4:]
            params = []
            if " " in msg:
                parts = msg.split()
                cmd = parts[0]
                params = parts[1:]
            else:
                cmd = msg
            await self.process_command(cmd, params, guildId, channelId, sender_username)


    async def process_command(self, command, params, guildId, channelId, sender):
        msg = ""
        filepath = None
        
        if command == "help":
            msg = "```\n"
            for key in self.help:
                msg += f"{key}: {self.help[key]}\n"
            msg += '```'
        elif command in self.messages:
            msg = self.messages[command]    # get msg from messages.json

        if command in self.file_path_dict:
            filepath = self.file_path_dict[command]     # full path included in json

        if msg != "" or filepath is not None:
            await self.send_channel_message(guildId, channelId, msg, filepath)

    async def send_channel_message(self, guildId, channelId, message, filepath=None):
        msg_guild = None
        for guild in self.guilds:
            if guild.id == guildId:
                msg_guild = guild
                break

        if msg_guild:
            msg_channel = None
            for channel in msg_guild.channels:
                if channel.id == channelId:
                    msg_channel = channel
                    break
            if msg_channel and filepath is None:
                await msg_channel.send(message)
            elif msg_channel:
                await msg_channel.send(message, file=discord.File(filepath))


token = ""
with open("/<ANYBOTTY_DIR>/auth.json") as jfile:
    data = json.load(jfile)
    token = data['token']

client = AnyBottyClient()
client.run(token)
