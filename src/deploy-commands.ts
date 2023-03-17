/* eslint @typescript-eslint/no-var-requires: "off" */
import { config } from 'dotenv'
import { REST, type RouteLike, Routes, type SlashCommandBuilder } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'

config()
if (process.env.TOKEN == null || process.env.CLIENT_ID == null || process.env.ENVIRONMENT == null) {
	throw Error('The environment variables [TOKEN, CLIENT_ID, ENVIRONMENT] are not set correctly.')
}
const commands: SlashCommandBuilder[] = []
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
}
// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? '')

// Get route to deploy based on environment
function getRoute(environment: string): RouteLike {
	if (environment === 'prod') {
		return Routes.applicationCommands(process.env.CLIENT_ID ?? '')
	}

	if (process.env.GUILD_ID == null) {
		throw Error('The environment variable [GUILD_ID] is not set correctly.')
	}

	return Routes.applicationGuildCommands(process.env.CLIENT_ID ?? '', process.env.GUILD_ID)
}

// and deploy your commands!
void (async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)
		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			getRoute(process.env.ENVIRONMENT ?? ''),
			{ body: commands }
		)
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
		// console.log(typeof data)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()
