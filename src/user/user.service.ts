import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class UserService {
  constructor(private readonly neo4jService: Neo4jService){}

  create(createUserDto): any {
    console.log({ createUserDto })
    return this.neo4jService.write(
      `

      CREATE (t1:TEAM { name: 'team1' })
      CREATE (t2:TEAM { name: 'team2' })
      
      CREATE (m1:USER:MANAGER { name: 'Manager 1', email: 'manager1@gmail.com', commission: 2.8 })
      CREATE (m2:USER:MANAGER { name: 'Manager 2', email: 'manager2@gmail.com', commission: 2.8 })
      
      CREATE (c1:USER:COORDINADOR { name: 'Coordinador 1', email: 'coordinador1@gmail.com', commission: 2.2 })
      CREATE (c2:USER:COORDINADOR { name: 'Coordinador 2', email: 'coordinador2@gmail.com', commission: 2.2 })
      CREATE (c3:USER:COORDINADOR { name: 'Coordinador 3', email: 'coordinador3@gmail.com', commission: 2.2 })
      
      CREATE (p1:USER:PRODUCTOR { name: 'Productor 1', email: 'productor1@gmail.com', commission: 1.7 })
      CREATE (p2:USER:PRODUCTOR { name: 'Productor 2', email: 'productor2@gmail.com', commission: 1.7 })
      CREATE (p3:USER:PRODUCTOR { name: 'Productor 3', email: 'productor3@gmail.com', commission: 1.7 })
      CREATE (p4:USER:PRODUCTOR { name: 'Productor 4', email: 'productor4@gmail.com', commission: 1.7 })
      CREATE (p5:USER:PRODUCTOR { name: 'Productor 5', email: 'productor5@gmail.com', commission: 1.7 })

      CREATE (t1) <- [:BELONGS_TO_TEAM { startDate: timestamp() }] - (m1) 
      CREATE (t2) <- [:BELONGS_TO_TEAM { startDate: timestamp() }] - (m2) 
      
      CREATE (m1) - [:SUPERVISES_TO { startDate: timestamp() }] -> (c1)
      CREATE (m1) - [:SUPERVISES_TO { startDate: timestamp() }] -> (c2)
      CREATE (m2) - [:SUPERVISES_TO { startDate: timestamp() }] -> (c3)

      CREATE (c1) - [:SUPERVISES_TO { startDate: timestamp() }] -> (p1)

      CREATE (c2) - [:SUPERVISES_TO { startDate: timestamp() }] -> (p2)
      CREATE (c2) - [:SUPERVISES_TO { startDate: timestamp() }] -> (p3)
      
      
      CREATE (c3) - [:SUPERVISES_TO { startDate: timestamp() }] -> (p4)
      CREATE (c3) - [:SUPERVISES_TO { startDate: timestamp() }] -> (p5)

      WITH p1
      MATCH p = (supervisor:USER)-[:SUPERVISES_TO*1..5]->(p1)
      WITH p1, p, 
         REDUCE(nodes = [], n IN NODES(p) | 
           CASE WHEN n.commission IS NOT NULL 
                THEN nodes + n 
                ELSE nodes 
           END) AS supervisors
      WHERE SIZE(supervisors) > 0

      CREATE (sale:SALE { 
             product: 'ATR', 
             comissionAmount: 6000 
         })

      CREATE (p1)-[r_seller:OWNER { 
             amount: p1.commission * sale.comissionAmount,
             comission: p1.commission,
             isOwner: true,
             level: 0 
         }]->(sale)

       CREATE (p1)-[c_seller:HAS_COMMISSION { 
             amount: p1.commission * sale.comissionAmount,
             comission: p1.commission,
             isOwner: true,
             level: 0 
         }]->(sale)
      
       WITH p1 as seller, sale, supervisors

       UNWIND RANGE(0, SIZE(supervisors)-2) AS i

      WITH seller, 
        sale, 
        supervisors[i] AS current_supervisor,
        CASE 
            WHEN i = SIZE(supervisors)-1 THEN seller
            ELSE supervisors[i+1]
        END AS supervised,
        i

       CREATE (current_supervisor)-[r:HAS_COMMISSION { 
          amount: (current_supervisor.commission - supervised.commission) * sale.comissionAmount,
          commission: ROUND((current_supervisor.commission - supervised.commission) * 100) / 100,
          level: i+1 
        }]->(sale)

      RETURN sale
       `,
    {}
    );
  }

  

  update(): any {
    return this.neo4jService.write(`
      MATCH (p:USER :PRODUCTOR {name: 'Productor 1'})<-[r:SUPERVISES_TO]-(c:USER :COORDINADOR {name: 'Coordinador 1'}),
      (c2:USER :COORDINADOR {name: 'Coordinador 3'})
      DELETE r
      CREATE (c2)-[:SUPERVISES_TO]->(p);
      `);
  }
}
