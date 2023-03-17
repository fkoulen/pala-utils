import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const data: SlashCommandBuilder = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!')

export async function execute (interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.reply('Pong!')
}
