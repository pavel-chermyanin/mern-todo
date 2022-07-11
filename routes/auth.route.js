const { Router } = require('express')
const { check, validationResult } = require('express-validator')
const User = require('../models/User')
const router = Router()
const bcrypt = require('bcryptjs')
const jwtToken = require('jsonwebtoken')



router.post('/registration',
    // массив с middleware 
    [
        // middleware check проверит поле email
        // вторым параметром текст ошибки
        // isEmail() проверит на корректность
        check('email', 'Некорректный email')
            .isEmail(),
        // поле password должно быть не менее 6 символов
        check('password', 'Некорректный пароль')
            .isLength({ min: 6 }),
    ],
    async (req, res) => {
        try {

            // validationResult отловит ошибки
            // запишем их в errors
            const errors = validationResult(req)
            // если ошибки есть
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    // вернем все ошибки в массиве
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                })
            }

            const { email, password } = req.body

            // есть ли пользователь с таким email в БД ?
            const isUsed = await User.findOne({ email })

            // если есть, то return...
            if (isUsed) {
                return res.status(300).json({ message: 'Данный email уже занят,попробуйте другой' })
            }

            // перед созданием user захешируем пароль
            const hashPassword = await bcrypt.hash(
                password, 12
            )

            // создаем user при помощи модели
            const user = new User({
                email,
                password: hashPassword
            })

            // сохраняем в базу
            await user.save()

            res.status(201).json({ message: 'Пользователь создан' })
        } catch (error) {
            console.log(error);
        }
    })
router.post('/login',
    // массив с middleware 
    [
        // middleware check проверит поле email
        // вторым параметром текст ошибки
        // isEmail() проверит на корректность
        check('email', 'Некорректный email')
            .isEmail(),
        // exists() проверит что поле password существует
        check('password', 'Некорректный пароль')
            .exists()
    ],
    async (req, res) => {
        try {

            // validationResult отловит ошибки
            // запишем их в errors
            const errors = validationResult(req)
            // если ошибки есть
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    // вернем все ошибки в массиве
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                })
            }

            const { email, password } = req.body

            // если нет такого user то return
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({
                    message: 'Такого email нет в базе'
                })
            }

            // мы должны сравнить введеный пароль с захешированным из БД
            const isMatch = bcrypt.compare(
                password,
                user.password
            )
            //если пароли не совпали то return
            if (!isMatch) {
                return res.status(400).json({
                    message: 'Пароли не совпадают'
                })
            }


            // секретная строка
            const jwtSecret = 'dsfdsf58989vbmvmnmbn'
            // создаем токен(id) из _id user
            const token = jwtToken.sign(
                {userId: user._id},
                jwtSecret,
                {expiresIn: '1h'}
            )

            res.json({token, userId: user._id})


        } catch (error) {
            console.log(error);
        }
    })

module.exports = router