import { UtilsService } from '../../table/services/utils/utils.service';
import { KeyMap } from '../../table/interfaces/table-builder.internal';
import { checkValueIsEmpty } from '../../table/operators/check-value-is-empty';

describe('UtilsService', () => {
    let utils: UtilsService;
    beforeEach(() => (utils = new UtilsService(null)));

    it('should be created', () => {
        expect(utils).toBeTruthy();
    });

    it('should be correct flatten keys', () => {
        const row: KeyMap = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3
                },
                g: [1, 2, 3]
            }
        };

        expect(utils.flattenKeysByRow(row)).toEqual(['a', 'b.c', 'b.d.e', 'b.g']);
    });

    it('should be correct check invalid value', () => {
        expect(checkValueIsEmpty(null)).toEqual(true);
        expect(checkValueIsEmpty(NaN)).toEqual(true);
        expect(checkValueIsEmpty(Infinity)).toEqual(true);
        expect(checkValueIsEmpty(undefined)).toEqual(true);
        expect(checkValueIsEmpty('    ')).toEqual(true);
    });

    it('should be correct deep object', () => {
        class Person {
            constructor(public name: string, public city: string) {}
        }

        Person.prototype['age'] = 25;
        const willem: Person = new Person('Willem', 'Groningen');

        expect(utils.flattenKeysByRow(willem)).toEqual(['name', 'city']);
    });
});
