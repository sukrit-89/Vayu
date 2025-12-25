require('dotenv').config();
const mongoose = require('mongoose');
const CommunityAction = require('./models/CommunityAction');

mongoose.connect(process.env.MONGO_URI);

async function seedCommunityActions() {
    console.log('🌱 Seeding community actions...');

    const actions = [
        {
            title: 'Sign Petition: Clean Air for Delhi',
            description: 'Join 50,000+ citizens demanding stricter emission controls in Delhi NCR.',
            action_type: 'petition',
            action_url: 'https://change.org/p/clean-air-delhi',
            is_active: true,
            completed_count: 1245
        },
        {
            title: 'Report Pollution Hotspot',
            description: 'Seen excessive smoke or burning? Report it to authorities instantly.',
            action_type: 'report',
            action_url: 'https://cpcb.nic.in/complaint',
            is_active: true,
            completed_count: 892
        },
        {
            title: 'Join Tree Plantation Drive',
            description: 'Weekend plantation drive in your locality. Plant 10 trees, fight pollution!',
            action_type: 'awareness',
            action_url: 'https://example.com/plant-trees',
            is_active: true,
            completed_count: 543
        },
        {
            title: 'Share Air Quality Tips',
            description: 'Spread awareness! Share this app with 3 friends to help them breathe better.',
            action_type: 'awareness',
            action_url: 'share://app',
            is_active: true,
            completed_count: 2134
        },
        {
            title: 'Demand Public Transport Expansion',
            description: 'Petition your local government for more buses and metro lines.',
            action_type: 'petition',
            action_url: 'https://example.com/public-transport',
            is_active: true,
            completed_count: 678
        }
    ];

    try {
        // Clear existing actions
        await CommunityAction.deleteMany({});
        console.log('✅ Cleared existing actions');

        // Insert new actions
        await CommunityAction.insertMany(actions);
        console.log('✅ Inserted 5 community actions');

        const count = await CommunityAction.countDocuments();
        console.log(`📊 Total actions in database: ${count}`);

    } catch (error) {
        console.error('❌ Error seeding:', error);
    } finally {
        mongoose.connection.close();
        console.log('✅ Database connection closed');
    }
}

seedCommunityActions();
