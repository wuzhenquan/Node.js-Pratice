const questions = [
    'What is you name?',
    'What is you fav hobby?',
    'What is you preferred programming language?'
]

let answers = []

function ask(i) {
    process.stdout.write(`\n\n\n ${questions[i]}`)
    process.stdout.write(' > ')
}

// this means that when a user types some data into the terminal 
// and hits enter we will raise this data event here
process.stdin.on('data', (data) => {
    answers.push(data.toString().trim())
    if (answers.length < questions.length) {
        ask(answers.length)
    } else {
        process.exit()
    }
})

process.on('exit', () => {
    process.stdout.write('\n\n\n')
    process.stdout.write(`Go ${answers[1]} ${answers[0]} you can finish writing ${answers[2]} late`)
    process.stdout.write('\n\n\n')
})

ask(0)
