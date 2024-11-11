import { Injectable } from '@nestjs/common';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class SettlementService {
  constructor (private readonly neo4jService: Neo4jService) {}

  create(): any {
    return this.neo4jService.write(
      `
      MATCH (u:USER)-[r:HAS_COMMISSION]->(s:SALE)
      CREATE (settlement:SETTLEMENT {
          createdAt: timestamp(),
          userId: u.email,
          userName: u.name,
          saleId: id(s),
          product: s.product,
          level: r.level,
          baseCommission: r.commission,
          saleAmount: s.comissionAmount,
          settlementAmount: ROUND(r.commission * s.comissionAmount * 100) / 100,
          status: 'PENDING'
      })
      CREATE (settlement)-[:BELONGS_TO]->(u)
      RETURN settlement
      `,
    )
  }

}
