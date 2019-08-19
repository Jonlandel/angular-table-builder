import { Injectable } from '@angular/core';

import { NgxColumnComponent } from '../../components/ngx-column/ngx-column.component';
import {
    ColumnsSchema,
    ColumnsSimpleOptions,
    ImplicitContext,
    TableCellOptions,
    TableColumn,
    TableSchema
} from '../../interfaces/table-builder.external';
import { DeepPartial, KeyMap, QueryListRef } from '../../interfaces/table-builder.internal';
import { TemplateCellCommon } from '../../directives/rows/template-cell.common';
import { SchemaBuilder } from './schema-builder.class';
import { TemplateHeadThDirective } from '../../directives/rows/template-head-th.directive';
import { TemplateBodyTdDirective } from '../../directives/rows/template-body-td.directive';
import { ColumnOptions } from '../../components/common/column-options';
import { UtilsService } from '../utils/utils.service';

interface TemplateParser {
    mergeWithSchema(schema: DeepPartial<TableSchema>): SchemaBuilder;
}

@Injectable()
export class TemplateParserService implements TemplateParser {
    public schema: SchemaBuilder;
    public templateKeys: Set<string>;
    public fullTemplateKeys: Set<string>;
    public overrideTemplateKeys: Set<string>;
    public columnOptions: ColumnOptions;
    private columnsSchema: ColumnsSchema = {};

    constructor(private readonly utils: UtilsService) {}

    private static templateContext(key: string, cell: TemplateCellCommon, options: ColumnOptions): TableCellOptions {
        return {
            textBold: cell.bold,
            template: cell.template,
            class: cell.cssClasses,
            style: cell.cssStyles,
            width: cell.width,
            height: cell.height,
            onClick: cell.onClick,
            dblClick: cell.dblClick,
            useDeepPath: key.includes('.'),
            context: cell.row ? ImplicitContext.ROW : ImplicitContext.CELL,
            nowrap: TemplateParserService.getValidPredicate(options.nowrap, cell.nowrap)
        };
    }

    private static getValidHtmlBooleanAttribute(attribute: boolean): boolean {
        return typeof attribute === 'string' ? true : attribute;
    }

    private static getValidPredicate<T>(leftPredicate: T, rightPredicate: T): T {
        return leftPredicate === null ? rightPredicate : leftPredicate;
    }

    public reset(columnOptions: ColumnOptions, customModelColumnsKeys: string[], modelColumnKeys: string[]): void {
        this.columnsSchema = {};
        this.schema = new SchemaBuilder([], this.schema.allRenderedColumnKeys);
        this.initialColumnOptions(columnOptions);
        this.setAllowedKeyMap(modelColumnKeys);
    }

    public toggleColumnVisibility(key: string): void {
        this.schema.columnsSimpleOptions = {
            ...this.schema.columnsSimpleOptions,
            [key]: {
                isModel: this.schema.columnsSimpleOptions[key].isModel,
                visible: !this.schema.columnsSimpleOptions[key].visible
            }
        };
    }

    public initialSchema(columnOptions: ColumnOptions, schema: DeepPartial<TableSchema>): TemplateParserService {
        this.schema = this.schema || this.mergeWithSchema(schema || {});
        this.initialColumnOptions(columnOptions);
        return this;
    }

    public mergeWithSchema(schema: DeepPartial<TableSchema>): SchemaBuilder {
        const displayedColumns: string[] = schema.displayedColumns || [];
        const allRenderedColumnKeys: string[] = schema.allRenderedColumnKeys || [];
        const columnsSimpleOptions: ColumnsSimpleOptions = schema.columnsSimpleOptions as ColumnsSimpleOptions;
        this.columnsSchema = schema.columns as ColumnsSchema;
        return new SchemaBuilder(displayedColumns, allRenderedColumnKeys, columnsSimpleOptions);
    }

    public initialColumnOptions(columnOptions: ColumnOptions): void {
        this.templateKeys = new Set<string>();
        this.overrideTemplateKeys = new Set<string>();
        this.fullTemplateKeys = new Set<string>();
        this.columnOptions = columnOptions || new ColumnOptions();
    }

    public parse(allowedKeyMap: KeyMap<boolean>, templates: QueryListRef<NgxColumnComponent>): void {
        if (templates) {
            templates.forEach((column: NgxColumnComponent) => {
                const { key, customKey, importantTemplate }: NgxColumnComponent = column;
                const needTemplateCheck: boolean = allowedKeyMap[key] || customKey !== false;

                if (needTemplateCheck) {
                    if (importantTemplate !== false) {
                        this.templateKeys.delete(key);
                        this.compileColumnMetadata(column);
                        this.overrideTemplateKeys.add(key);
                    } else if (!this.templateKeys.has(key) && !this.overrideTemplateKeys.has(key)) {
                        this.compileColumnMetadata(column);
                        this.templateKeys.add(key);
                    }

                    this.fullTemplateKeys.add(key);
                }
            });
        }
    }

    public setAllowedKeyMap(modelKeys: string[]): void {
        this.schema.allRenderedColumnKeys.forEach((key: string) => {
            this.schema.columnsSimpleOptions[key] = {
                isModel: modelKeys.includes(key),
                visible:
                    this.schema.columnsSimpleOptions[key] !== undefined
                        ? this.schema.columnsSimpleOptions[key].visible
                        : true
            };
        });
    }

    public updateState(key: string, value: Partial<TableColumn>): void {
        this.schema.columns = {
            ...this.schema.columns,
            [key]: { ...this.schema.columns[key], ...value }
        };
    }

    public compileColumnMetadata(column: NgxColumnComponent): void {
        const { key, th, td, emptyHead, headTitle }: NgxColumnComponent = column;
        const thTemplate: TemplateCellCommon = th || new TemplateHeadThDirective(null);
        const tdTemplate: TemplateCellCommon = td || new TemplateBodyTdDirective(null);
        const isEmptyHead: boolean = TemplateParserService.getValidHtmlBooleanAttribute(emptyHead);
        const thOptions: TableCellOptions = TemplateParserService.templateContext(key, thTemplate, this.columnOptions);

        this.schema.columns[key] =
            this.schema.columns[key] ||
            this.utils.mergeDeep<TableColumn>(
                {
                    th: {
                        ...thOptions,
                        headTitle,
                        emptyHead: isEmptyHead,
                        template: isEmptyHead ? null : thOptions.template
                    },
                    td: TemplateParserService.templateContext(key, tdTemplate, this.columnOptions),
                    stickyLeft: TemplateParserService.getValidHtmlBooleanAttribute(column.stickyLeft),
                    stickyRight: TemplateParserService.getValidHtmlBooleanAttribute(column.stickyRight),
                    customColumn: TemplateParserService.getValidHtmlBooleanAttribute(column.customKey),
                    width: TemplateParserService.getValidPredicate(column.width, this.columnOptions.width),
                    cssClass:
                        TemplateParserService.getValidPredicate(column.cssClass, this.columnOptions.cssClass) || [],
                    cssStyle:
                        TemplateParserService.getValidPredicate(column.cssStyle, this.columnOptions.cssStyle) || [],
                    resizable: TemplateParserService.getValidPredicate(column.resizable, this.columnOptions.resizable),
                    sortable: TemplateParserService.getValidPredicate(column.sortable, this.columnOptions.sortable),
                    filterable: TemplateParserService.getValidPredicate(
                        column.filterable,
                        this.columnOptions.filterable
                    ),
                    draggable: TemplateParserService.getValidPredicate(column.draggable, this.columnOptions.draggable),
                    verticalLine: column.verticalLine
                },
                (this.columnsSchema || {})[key]
            );
    }
}
