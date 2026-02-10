import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evidence } from './evidence.entity';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';

@Injectable()
export class EvidenceService {
    constructor(
        @InjectRepository(Evidence)
        private evidenceRepository: Repository<Evidence>,
    ) { }

    async create(createEvidenceDto: CreateEvidenceDto) {
        const evidence = this.evidenceRepository.create(createEvidenceDto);
        return await this.evidenceRepository.save(evidence);
    }

    async findAll() {
        return await this.evidenceRepository.find({
            relations: ['expense'],
        });
    }

    async findById(id: number) {
        return await this.evidenceRepository.findOne({
            where: { id },
            relations: ['expense'],
        });
    }

    async findByExpense(expenseId: number) {
        return await this.evidenceRepository.find({
            where: { expense: { id: expenseId } },
            relations: ['expense'],
        });
    }

    async findInvalid() {
        return await this.evidenceRepository.find({
            where: { isValid: false },
            relations: ['expense'],
        });
    }

    async update(id: number, updateEvidenceDto: UpdateEvidenceDto) {
        await this.evidenceRepository.update(id, updateEvidenceDto);
        return this.findById(id);
    }

    async remove(id: number) {
        return await this.evidenceRepository.delete(id);
    }
}
