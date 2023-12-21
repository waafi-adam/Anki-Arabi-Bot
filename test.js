const Reverso = require('reverso-api')
const reverso = new Reverso()

word = "ضرب"
const main = async() =>{
    try {
        resp = await reverso.getConjugation(word, 'arabic');
        console.log(resp)
        let conjugation = [];
        for (const form of resp.verbForms){
            console.log(form.conjugation);
            console.log(form.verbs);
            if (form.conjugation == 'Active Past')
                conjugation[0] = { type: `Active Past (ماضي)`, verb: form.verbs[3] };
            if (form.conjugation == 'Active Present')
                conjugation[1] = { type: `Active Present (مضارع)`, verb: form.verbs[3] };
            if (form.conjugation == 'Imperative')
                conjugation[2] = { type: `Imperative (أمر)`, verb: form.verbs[0] };
            if (form.conjugation == 'Verbal noun')
                conjugation[3] = { type: `Verbal noun (مصدر)`, verb: form.verbs[0] };
            if (form.conjugation == 'Participles Active')
                conjugation[4] = { type: `Participles Active (فاعل)`, verb: form.verbs[0] };
            if (form.conjugation == 'Participles Passive')
                conjugation[5] = { type: `Participles Passive (مفعول)`, verb: form.verbs[0] };
        }
        console.log(conjugation); 
        console.log(conjugation.reduce((acc,item)=> acc + `${item.verb} | ${item.type}<br>`, ""));
    } catch (error) {
        console.log(error);
    }
}
main();

// reverso.getConjugation('идти', 'russian', (err, response) => {
//     if (err) throw new Error(err.message)

//     console.log(response)
// })