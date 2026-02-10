import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evidence } from './evidence.entity';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { Expense } from '../expenses/expense.entity';

@Injectable()
export class EvidenceService {
    constructor(
        @InjectRepository(Evidence)
        private evidenceRepository: Repository<Evidence>,
        @InjectRepository(Expense)
        private expenseRepository: Repository<Expense>,
    ) { }

    async create(createEvidenceDto: CreateEvidenceDto) {
        const evidence = new Evidence();
        evidence.fileName = createEvidenceDto.fileName;
        evidence.filePath = createEvidenceDto.filePath;
        evidence.fileUrl = createEvidenceDto.fileUrl;
        evidence.fileType = createEvidenceDto.fileType;
        evidence.fileSize = createEvidenceDto.fileSize;
        evidence.description = (createEvidenceDto.description ?? null) as string | null;
        evidence.notes = (createEvidenceDto.notes ?? null) as string | null;

        // Resolver relación de expense
        if (createEvidenceDto.expenseId) {
            const expense = await this.expenseRepository.findOne({
                where: { id: createEvidenceDto.expenseId },
            });
            if (!expense) {
                throw new Error(`Expense con id ${createEvidenceDto.expenseId} no encontrado`);
            }
            evidence.expense = expense;
        }

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
