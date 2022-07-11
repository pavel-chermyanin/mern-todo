const express =require('express')
const mongoose =require('mongoose')


const app = express()
const PORT = process.env.PORT || 5000

// чтобы понимать json
app.use(express.json({extended: true}))
// регистрируем роут
app.use('/api/auth', require('./routes/auth.route'))

async function start () {
    try {
        await mongoose.connect('mongodb+srv://merntodo:123@cluster0.g6hue.mongodb.net/?retryWrites=true&w=majority', {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: true
        })

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}

start()