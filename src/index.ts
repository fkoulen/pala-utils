// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from 'discord.js'

import { config } from 'dotenv'

config()

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (c: Client<true>) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
})

// Log in to Discord with your client's token
void client.login(process.env.TOKEN)
