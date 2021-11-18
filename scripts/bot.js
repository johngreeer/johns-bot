// declaring axios so the wrapper can make API calls when I call it 
const axios = require('axios')

// declaring variables outside of module.exports allows storage across interactions
let currentBook
let currentBookAuthor
let currentPage
let totalPages
let percentComplete // this var will always be (x/y)*100 but for some reason I had to put that inside the bot.respond instead of here. not sure why.
let pagesLeft

module.exports = function (bot) {
    // help guide
    bot.respond(/get started/i, function (res) {
        return res.send(`
        👋 Hi! I'm Book Buddy, your Slack companion for reading. Here's how I can be the most useful:

1. say \`@book-buddy isbn {isbn-number}\` and use your book's ISBN number, and I'll look up that book for you and save it as what you're reading right now! You can usually find the ISBN on the inside cover or back of your book 🤓

2. then, say \`@book-buddy bookmark {your-page}\` and I'll save what page you're on. 🔖

3. after that, you can always say \`@book-buddy what am i reading?\` and i'll remind you what book you're on, your bookmark, and more! ✨`)
    })
    
    // confirms bot is in the room
    bot.hear(/sup @book-buddy/i, function (res) {
        return res.send(`
        howdy 🤠  you can say \`@book-buddy get started\` to see what I can do.
        `)
    })

    // asks do you like to read
    bot.respond(/do you like to read?/i, function (res) {
        return res.send(`I don't like to read...I LOVE to read!!!`)
    })

    // asks for favorite book
    bot.respond(/what is your favorite book?/i, function (res) {
        return res.send(`Hm...probably... I-Robot >:)`)
    })

    // audiobooks
    bot.respond(/my eyes hurt/i, function (res) {
        return res.send(`Ack. Maybe try an audiobook? https://www.audible.com/`)
    })

    // libraries
    bot.respond(/I lost my book/i, function (res) {
        return res.send(`Not to worry, use this to find your nearest library: https://www.worldcat.org/libraries`)
    })

    // check what the current book is
    bot.respond(/What am I reading?/i, function (res){
        percentComplete = Math.ceil((currentPage / totalPages) * 100) // needs to be here and not outside the module.exports for some reason
        pagesLeft = totalPages - currentPage // pagesLeft will always be this but keep it here and not in the list of vars at the bottom
        return res.send(`
    You're currently reading *${currentBook}* by ${currentBookAuthor}.
    🔖 You're currently on page ${currentPage}. 
    ⏳ You have ${pagesLeft} pages to go.
    📈 You are ${percentComplete}% complete!`
        )
    })

    // takes in a book for input
    bot.respond(/I am reading (.*)/i, function (res) {
        currentBook = res.match[1]
        return res.send(`Got it! You're currently reading ${currentBook}`)
    })

    // saves what page you're currently on
    bot.respond(/bookmark (.*)/i, function (res) {
        currentPage = res.match[1]
        return res.send(`Got it! You're currently on page ${currentPage}`)
    })

    // saves the total pages in your book
    bot.respond(/total pages (.*)/i, function (res) {
        totalPages = res.match[1]
        return res.send(`Got it! ${currentBook} has a total of ${totalPages} pages.`)
    })

    // tells user how many pages they have left to go
    bot.respond(/pages left?/i, function (res) {
        pagesLeft = totalPages - currentPage
        return res.send(`You've got ${pagesLeft} to go!`)
    })

    // uses API to GET the definition for a word (which the user provides)
    bot.respond(/define (.*)/i, async function (res) {
        definedWord = res.match[1]
        const getDefinition = async function () {
            const definition = await axios.get(`https://od-api.oxforddictionaries.com/api/v2/entries/en-us/` + definedWord,
            { // could probably put these headers in a variable and just call it here so it doesn't repeat
                headers: {
                    app_id : '1c1cbaa0',
                    app_key : '81b88d5d59705d02a29511ecd42ffe9b'
                }
            })
            return definition.data.results[0]
        }
        const definition = await getDefinition()
        // console.log(definition.lexicalEntries[0].entries[0].senses[0].definitions[0])
        return res.send(`Oxford Dictionary defines "${definedWord}" as: \`\`\`${definition.lexicalEntries[0].entries[0].senses[0].definitions[0]}\`\`\``)
    })

    // uses API to GET information about a book, and saves Book Title and Total Pages to variables.
    bot.respond(/isbn (.*)/i, async function (res) {
        bookIsbn = res.match[1]
        const getBookInfo = async function () {
            const isbn = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:` + bookIsbn , {
                params: {
                    format: 'json',
                    jscmd: 'data'
                }
            })
            return isbn
        }
        const isbn = await getBookInfo()
        // used for digging into api responses, console.log(isbn.data[`ISBN:${bookIsbn}`])
        
        // setting variables to API results
        currentBook = `${isbn.data[`ISBN:${bookIsbn}`].title}`
        totalPages = `${isbn.data[`ISBN:${bookIsbn}`].number_of_pages}`
        currentBookAuthor = `${isbn.data[`ISBN:${bookIsbn}`].authors[0].name}`
        // end setting variables

        return res.send(`
        Got it! Here's some information about that book:
📔 Title: ${isbn.data[`ISBN:${bookIsbn}`].title}
✍️ Author: ${isbn.data[`ISBN:${bookIsbn}`].authors[0].name}
📜 Number of pages: ${isbn.data[`ISBN:${bookIsbn}`].number_of_pages}
👩‍💻 Read more about this book at ${isbn.data[`ISBN:${bookIsbn}`].url}
        `)
    })

    // clears some vertical space up in the slack channel
    bot.respond(/I need some air/i, function (res) {
        return res.send(`Roger that
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        .
        `)
    })

} // <- careful, this bracket is the end of modules.export

/* RESOURCES FOR THIS FILE
    - go here to configure slack things: https://q4lotechdata2021.slack.com/services/B02L6FXS7L7 
    - hubot lab docs: https://jsd.ga-curriculum.com/docs/unit-1/in-class-lab#introduction 
    - API lesson from 11-15-21 https://jsd.ga-curriculum.com/docs/unit-2/js-and-apis
    - peek at Andre's bot code: https://github.com/anpato/andres-bot 

API 
    - dictionary API: https://developer.oxforddictionaries.com/documentation#!/Entries/get_entries_source_lang_word_id 
    - books API: https://openlibrary.org/dev/docs/api/books
       - testing ISBNs: 9780241980354 (east of eden) , 9780593133583 (brene brown)
*/
