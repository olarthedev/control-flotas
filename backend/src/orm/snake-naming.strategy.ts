import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

function snakeCase(value: string): string {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/\./g, '_')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
}

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    tableName(className: string, customName: string): string {
        return customName ? customName : snakeCase(className);
    }

    columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
        const name = customName ? customName : propertyName;
        return snakeCase(embeddedPrefixes.concat(name).join('_'));
    }

    relationName(propertyName: string): string {
        return snakeCase(propertyName);
    }

    joinColumnName(relationName: string, referencedColumnName: string): string {
        return snakeCase(`${relationName}_${referencedColumnName}`);
    }

    joinTableName(
        firstTableName: string,
        secondTableName: string,
        firstPropertyName: string,
        secondPropertyName: string,
    ): string {
        return snakeCase(`${firstTableName}_${firstPropertyName.replace(/\./g, '_')}_${secondTableName}`);
    }

    joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
        return snakeCase(`${tableName}_${columnName ? columnName : propertyName}`);
    }

    classTableInheritanceParentColumnName(parentTableName: string, parentTableIdPropertyName: string): string {
        return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
    }

    eagerJoinRelationAlias(alias: string, propertyPath: string): string {
        return snakeCase(`${alias}_${propertyPath.replace('.', '_')}`);
    }
}
