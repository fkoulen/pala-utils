// Require the necessary discord.js classes
import { Client, type ClientOptions, Collection, Events, GatewayIntentBits } from 'discord.js'

import { config } from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

config()

class DiscordClient extends Client {
	public commands: Collection<string, any>

	constructor (options: ClientOptions) {
		super(options)
		this.commands = new Collection()
	}
}

// Create a new client instance
const client = new DiscordClient({ intents: [GatewayIntentBits.Guilds] })

loadCommandFiles()

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return

	const discordClient = interaction.client as DiscordClient
	const command = discordClient.commands.get(interaction.commandName)

	if (command == null) {
		console.error(`No command matching ${interaction.commandName} was found.`)
		return
	}

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		if (interaction.replied != null || interaction.deferred != null) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true
			})
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
		}
	}
})

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
})

// Log in to Discord with your client's token
void client.login(process.env.TOKEN)

function loadCommandFiles(): void {
	const commandsPath = path.join(__dirname, 'commands')
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'))

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const command = require(filePath)
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
}
