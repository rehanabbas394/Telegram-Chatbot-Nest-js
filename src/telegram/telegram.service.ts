import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Context, Telegraf } from 'telegraf';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import fetch from 'node-fetch';
import { jokes } from './util/jokes';
import { Command } from 'nestjs-telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot: Telegraf<Context>;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.setupBot();
  }

  async onModuleInit() { 
    try {
      await this.bot.launch();
      this.logger.log('Bot successfully launched');

      // Enable graceful stop
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      this.logger.error('Failed to launch bot', error.stack);
    }
  }

  setupBot() {
    this.bot.start(async (ctx) => {
      const chatId = ctx.chat.id;
      const user = await this.findOrCreateUser(chatId);
      console.log(user)
      ctx.reply(`Welcome ${user || 'User'}!`);
    });
    

    this.bot.help((ctx) => {
      ctx.reply('Available Commands:\n/help - Show help\n/weather - Get weather info\n/joke - Get a random joke\n/sticker - sticker');
    });

    this.bot.command('weather', async (ctx) => {
      const city = 'Islamabad';
      try {
        const weather = await this.weatherInfo(city);
        ctx.reply(weather);
      } catch (error) {
        ctx.reply(`Sorry, couldn't fetch the weather for ${city}.`);
        this.logger.error('Failed to fetch weather', error.stack);
      }
    });

    this.bot.command('joke', (ctx) => {
      const joke = this.randomJoke();
      ctx.reply(`Joke: ${joke}`);
    });

    this.bot.command('sticker', (ctx) => ctx.reply('Nice sticker! 😊👍'));

    if(!this.bot.command){
      this.bot.command('unrecongized command', (ctx) => ctx.reply('unrecongized command'))
    }
   this.bot.on('message',(msg)=>{
    let Hi= "hi";
    if (msg.text.toString().toLowerCase().indexOf(Hi)===0){
      this.sendMessage(msg.chat.id, "hlo how can i help you");
    }

    let response = "who are you";
    if(msg.text.toString().toLowerCase().includes("who")){
      this.sendMessage(msg.chat.id,"I am an intelligent telegram robot, built with Nest.js. Thanks for asking")
    }


    let response1 = "Do you love javascript";
      if(msg.text.toString().toLowerCase().includes("javascript")){
      this.sendMessage(msg.chat.id,"Yes I Love Javascript")
    }

   })
  }

  async weatherInfo(city: string): Promise<string> {
    const apikey = "678b4b63a2944a97ed3f2353eda5fc05";
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apikey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200) {
        throw new Error(data.message);
      }

      const weather = {
        description: data.weather[0].description,
        temp: data.main.temp,
        humidity: data.main.humidity,
        city: data.name,
      };

      return `The weather in ${weather.city} is ${weather.temp}°C, ${weather.description}, with a humidity of ${weather.humidity}%.`;
    } catch (error) {
      this.logger.error('Error fetching weather data:', error.message);
      throw error; // Rethrow error for handling in command callback
    }
  }

  randomJoke(): string {
      const joke = jokes;
      return joke[Math.floor(Math.random() * joke.length)];
  }

  async findOrCreateUser(chatId: number): Promise<User> {
    let user = await this.userRepository.findOne({ where: { chatId } });
    if (!user) {
      user = this.userRepository.create({ chatId });
      await this.userRepository.save(user);
    }
    return user;
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, text);
    } catch (error) {
      this.logger.error('Failed to send message', error.stack);
    }
  }
}
