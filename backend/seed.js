const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const SupportAgent = require('./models/SupportAgent');
const connectDB = require('./config/db');

dotenv.config();

const seedUsers = [
  {
    name: 'John User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    department: 'General',
  },
  {
    name: 'Sarah Agent',
    email: 'agent@example.com',
    password: 'password123',
    role: 'agent',
    department: 'Support',
  },
  {
    name: 'Mike Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    department: 'Support',
  },
  {
    name: 'Demo User',
    email: 'demo-user@example.com',
    password: 'Test123!',
    role: 'user',
    department: 'Demo',
  },
  {
    name: 'Demo Manager',
    email: 'demo-manager@example.com',
    password: 'Test123!',
    role: 'manager',
    department: 'Demo',
  },
  {
    name: 'John Smith',
    email: 'john.smith@support.com',
    password: 'Agent123!',
    role: 'agent',
    department: 'Support',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@support.com',
    password: 'Agent123!',
    role: 'agent',
    department: 'Support',
  },
  {
    name: 'Mike Davis',
    email: 'mike.davis@support.com',
    password: 'Agent123!',
    role: 'agent',
    department: 'Support',
  },
  {
    name: 'General Support Agent',
    email: 'general@support.com',
    password: 'Agent123!',
    role: 'agent',
    department: 'Support',
  },
];

const seedSupportAgents = [
  {
    name: 'John Smith',
    role: 'Developer',
    expertise: ['Bug', 'Feature', 'Other'],
    email: 'john.smith@support.com',
    isActive: true,
  },
  {
    name: 'Sarah Johnson',
    role: 'Payment Specialist',
    expertise: ['Payment', 'Other'],
    email: 'sarah.johnson@support.com',
    isActive: true,
  },
  {
    name: 'Mike Davis',
    role: 'Support Engineer',
    expertise: ['Login', 'Bug', 'Other'],
    email: 'mike.davis@support.com',
    isActive: true,
  },
  {
    name: 'General Support Agent',
    role: 'Generalist',
    expertise: ['Bug', 'Login', 'Payment', 'Feature', 'Other'],
    email: 'general@support.com',
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing users and agents
    await User.deleteMany({});
    await SupportAgent.deleteMany({});
    console.log('Cleared existing users and agents');

    // Create new users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
    }
    
    // Create support agents
    const createdAgents = [];
    for (const agentData of seedSupportAgents) {
      const agent = new SupportAgent(agentData);
      const savedAgent = await agent.save();
      createdAgents.push(savedAgent);
    }

    console.log(`✅ Successfully seeded ${createdUsers.length} users:`);
    createdUsers.forEach((user, idx) => {
      const password = seedUsers[idx].password;
      console.log(`   - ${user.role.toUpperCase()}: ${user.email} / ${password}`);
    });

    console.log(`\n✅ Successfully seeded ${createdAgents.length} support agents:`);
    createdAgents.forEach(agent => {
      console.log(`   - ${agent.name} (${agent.role}): Expertise in [${agent.expertise.join(', ')}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
