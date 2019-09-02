import { ColumnsSchema } from '../../interfaces/table-builder.external';
import { DeepPartial } from '../../interfaces/table-builder.internal';

export class SchemaBuilder {
    constructor(public columns: ColumnsSchema[] = []) {}

    public exportColumns(): Array<DeepPartial<ColumnsSchema>> {
        return this.columns.map((column: ColumnsSchema) => ({
            key: column.key,
            width: column.width,
            isVisible: column.isVisible,
            isModel: column.isModel
        }));
    }
}
