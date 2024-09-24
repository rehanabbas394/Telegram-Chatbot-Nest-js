import { Controller, Get, Post, Body, Param, Response, HttpStatus} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UserDto } from './dto/user.dto';

@Controller('telegram/')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

@Get('')
message(@Response() res){
  this.telegramService.setupBot()
  return res.status(HttpStatus.OK).send("server started")
}

  @Post('send')
  async sendMessage(@Body() userDto: UserDto) {
    const { chatId, text } = userDto;
    try {
      await this.telegramService.sendMessage(chatId, text);
      return { status: 'Message sent' };
    } catch (error) {
      return { status: 'Error', message: error.message };
    }
  }

  @Get('start/:chatId')
  async start(@Param('chatId') chatId: number) {
    const user = await this.telegramService.findOrCreateUser(chatId);
    return { status: 'User found or created', user };
  }

  @Get('help')
  getHelp() {
    return 'Available Commands: /help - Show help, /weather - Get weather info, /joke - Get a random joke';
  }

  // @Get('weather')
  // getWeather() {
  //   return this.telegramService.weatherInfo();
  // }

  @Get('joke')
  getJoke() {
    return this.telegramService.randomJoke();
  }
}
