import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Temporary in-memory store (we'll replace with Prisma later)
const users = []

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    }

    users.push(newUser)

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'Boundra_secret',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    })
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'Boundra_secret',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router