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

    /**
     * Create a new evidence record and optionally attach to an expense.
     * Throws NotFoundException if the referenced expense does not exist.
     */
    async create(createEvidenceDto: CreateEvidenceDto): Promise<Evidence> {
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
                throw new (require('@nestjs/common').NotFoundException)(
                    `Expense con id ${createEvidenceDto.expenseId} no encontrado`,
                );
            }
            evidence.expense = expense;
        }

        return await this.evidenceRepository.save(evidence);
    }

    /** Retrieve every piece of evidence, including linked expense. */
    async findAll(): Promise<Evidence[]> {
        return await this.evidenceRepository.find({
            relations: ['expense'],
        });
    }

    /** Find a specific evidence by id. */
    async findById(id: number): Promise<Evidence | null> {
        return await this.evidenceRepository.findOne({
            where: { id },
            relations: ['expense'],
        });
    }

    /** Evidence items attached to a particular expense. */
    async findByExpense(expenseId: number): Promise<Evidence[]> {
        return await this.evidenceRepository.find({
            where: { expense: { id: expenseId } },
            relations: ['expense'],
        });
    }

    /** Evidence marked as invalid. */
    async findInvalid(): Promise<Evidence[]> {
        return await this.evidenceRepository.find({
            where: { isValid: false },
            relations: ['expense'],
        });
    }

    /** Update evidence. Throws if not found. */
    async update(id: number, updateEvidenceDto: UpdateEvidenceDto): Promise<Evidence> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new (require('@nestjs/common').NotFoundException)('Evidence not found');
        }
        await this.evidenceRepository.update(id, updateEvidenceDto);
        return this.findById(id) as Promise<Evidence>;
    }

    /** Delete an evidence record. */
    async remove(id: number) {
        const result = await this.evidenceRepository.delete(id);
        if (result.affected === 0) {
            throw new (require('@nestjs/common').NotFoundException)('Evidence not found');
        }
        return result;
    }
}
