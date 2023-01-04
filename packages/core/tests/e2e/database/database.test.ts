import { defineHandler } from "../../../src";
import { createValidator } from "./validator"

type Item = { id: string; name: string }
type Validated<T> = { item: T; isValid: boolean; }
const samples : Item[] = [
    { id: '', name: 'Sample name' },
    { id: 'id1', name: 'Sample #001' }
]

describe('Database workflow', ()=> {

    it('Should create validator', ()=> {
        const validator = createValidator<Item>();

        validator.events.addValidator( (x)=>!!x.id )
        validator.events.addValidator( (x)=>(x.id||'').trim()!=='' )
        
        const result : Validated<Item>[] = [];
        defineHandler(validator.events.isValid, (item)=> {
            result.push( { item, isValid: true })
        })
        defineHandler(validator.events.isInvalid, (item)=> {
            result.push( { item, isValid: false })
        })

        validator.events.validate(...samples);

        const valid = result.filter(x=>x.isValid).map(x=>x.item.id);
        const invalid = result.filter(x=>!x.isValid).map(x=>x.item.id);

        expect(valid).toEqual(['id1'])
        expect(invalid).toEqual([''])
    })

    

})