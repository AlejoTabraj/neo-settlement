import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jModule } from 'nest-neo4j';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';
import { SettlementModule } from './settlement/settlement.module';

@Module({
  imports: [
    Neo4jModule.forRoot({
      scheme: 'neo4j',
      host: 'localhost',
      port: 7687,
      username: 'neo4j',
      password: 'testingneo'
    }),
    GroupModule,
    UserModule,
    SettlementModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
