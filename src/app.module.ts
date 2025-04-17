import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramModule } from './telegram/telegram.module';
import { User } from './telegram/entities/user.entity';
import { TelegramService } from './telegram/telegram.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true,envFilePath:".env"}),
    TypeOrmModule.forRoot({
      type:'mysql',
      host: 'localhost', 
      port: 3306,
      username: 'root',
      database: 'chatbot',
      password:"",
      synchronize:true, 
      entities:[User]
    }),
    TelegramModule, 
  ],
  controllers: [],    
  providers: [],
})
export class AppModule {}  
