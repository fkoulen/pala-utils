/* eslint @typescript-eslint/no-var-requires: "off" */
import { config } from 'dotenv'
import { REST, Routes, type SlashCommandBuilder } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'

config()

const commands: SlashCommandBuilder[] = []
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'))

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
}

console.log(commands)

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? '')

// and deploy your commands!
void (async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)
		let data: any
		// The put method is used to fully refresh all commands in the guild with the current set
		if (process.env.ENVIRONMENT === 'dev') {
			data = await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID ?? '', process.env.GUILD_ID ?? ''),
				{ body: commands }
			)
		} else if (process.env.ENVIRONMENT === 'prod') {
			data = await rest.put(
				Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
				{ body: commands }
			)
		}
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
		// console.log(typeof data)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()
