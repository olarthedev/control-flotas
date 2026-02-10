import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenceService } from './evidence.service';
import { EvidenceController } from './evidence.controller';
import { Evidence } from './evidence.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Evidence])],
    controllers: [EvidenceController],
    providers: [EvidenceService],
    exports: [EvidenceService],
})
export class EvidenceModule { }
