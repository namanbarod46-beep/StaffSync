const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync_db';
    console.log(`[StaffSync Seeder] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[StaffSync Seeder] Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      Attendance.deleteMany(),
      Leave.deleteMany(),
      Announcement.deleteMany(),
      Training.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[StaffSync Seeder] Creating users & employees...');

    // 1. HR User
    const hrUser = await User.create({
      name: 'Eleanor Vance (HR Director)',
      email: 'hr@staffsync.com',
      password: 'password123',
      role: 'hr',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    const hrEmployee = await Employee.create({
      user: hrUser._id,
      employeeId: 'EMP-1001',
      department: 'Human Resources',
      designation: 'Director of Human Resources',
      salary: 110000,
      phone: '+1 (555) 234-5678',
      dateOfJoining: new Date('2022-01-15'),
      skills: ['Talent Acquisition', 'Strategic HR', 'Conflict Resolution', 'Labor Laws'],
      leaveBalance: { annual: 20, sick: 10, casual: 7 },
    });

    // 2. Engineering Manager
    const engManagerUser = await User.create({
      name: 'Marcus Brody (Engineering Manager)',
      email: 'manager.tech@staffsync.com',
      password: 'password123',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    });

    const engManagerEmployee = await Employee.create({
      user: engManagerUser._id,
      employeeId: 'EMP-1002',
      department: 'Engineering',
      designation: 'VP of Engineering',
      reportingManager: hrUser._id,
      salary: 135000,
      phone: '+1 (555) 345-6789',
      dateOfJoining: new Date('2022-03-01'),
      skills: ['Node.js', 'System Architecture', 'Agile / Scrum', 'DevOps'],
      leaveBalance: { annual: 18, sick: 9, casual: 6 },
    });

    // 3. Sales & Marketing Manager
    const salesManagerUser = await User.create({
      name: 'Sophia Patel (Sales Director)',
      email: 'manager.sales@staffsync.com',
      password: 'password123',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    });

    const salesManagerEmployee = await Employee.create({
      user: salesManagerUser._id,
      employeeId: 'EMP-1003',
      department: 'Sales & Marketing',
      designation: 'Head of Growth & Marketing',
      reportingManager: hrUser._id,
      salary: 125000,
      phone: '+1 (555) 456-7890',
      dateOfJoining: new Date('2022-06-10'),
      skills: ['B2B Sales', 'Brand Strategy', 'CRM', 'Product Marketing'],
      leaveBalance: { annual: 16, sick: 10, casual: 7 },
    });

    // 4. Employee 1 (Default test employee: employee@staffsync.com)
    const emp1User = await User.create({
      name: 'John Doe (Senior Engineer)',
      email: 'employee@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });

    const emp1 = await Employee.create({
      user: emp1User._id,
      employeeId: 'EMP-1004',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
      reportingManager: engManagerUser._id,
      salary: 95000,
      phone: '+1 (555) 567-8901',
      dateOfJoining: new Date('2023-01-20'),
      skills: ['React.js', 'Node.js', 'MongoDB', 'TypeScript', 'GraphQL'],
      leaveBalance: { annual: 12, sick: 8, casual: 5 },
      address: {
        street: '742 Evergreen Terrace',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94107',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Mary Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 999-1234',
      },
    });

    // 5. Employee 2
    const emp2User = await User.create({
      name: 'Jane Smith (Frontend Specialist)',
      email: 'jane.smith@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const emp2 = await Employee.create({
      user: emp2User._id,
      employeeId: 'EMP-1005',
      department: 'Engineering',
      designation: 'Frontend UI/UX Engineer',
      reportingManager: engManagerUser._id,
      salary: 88000,
      phone: '+1 (555) 678-9012',
      dateOfJoining: new Date('2023-04-15'),
      skills: ['React', 'CSS3 / Sass', 'Figma', 'Accessibility (a11y)'],
      leaveBalance: { annual: 14, sick: 10, casual: 6 },
    });

    // 6. Employee 3
    const emp3User = await User.create({
      name: 'Alex Wong (Growth Specialist)',
      email: 'alex.wong@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const emp3 = await Employee.create({
      user: emp3User._id,
      employeeId: 'EMP-1006',
      department: 'Sales & Marketing',
      designation: 'Digital Marketing Lead',
      reportingManager: salesManagerUser._id,
      salary: 82000,
      phone: '+1 (555) 789-0123',
      dateOfJoining: new Date('2023-08-01'),
      skills: ['SEO', 'Content Strategy', 'Google Ads', 'Email Marketing'],
      leaveBalance: { annual: 13, sick: 7, casual: 4 },
    });

    // 7. Employee 4
    const emp4User = await User.create({
      name: 'Sarah Jenkins (HR Associate)',
      email: 'sarah.jenkins@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    });

    const emp4 = await Employee.create({
      user: emp4User._id,
      employeeId: 'EMP-1007',
      department: 'Human Resources',
      designation: 'Talent Acquisition Associate',
      reportingManager: hrUser._id,
      salary: 68000,
      phone: '+1 (555) 890-1234',
      dateOfJoining: new Date('2024-02-10'),
      skills: ['Recruitment', 'Onboarding', 'Payroll Support', 'Interviewing'],
      leaveBalance: { annual: 15, sick: 9, casual: 7 },
    });

    console.log('[StaffSync Seeder] Creating attendance logs...');
    // Create attendance logs for the last 5 days
    const now = new Date();
    const usersList = [hrUser, engManagerUser, salesManagerUser, emp1User, emp2User, emp3User, emp4User];

    for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
      const recordDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);
      const startOfDay = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate(), 0, 0, 0, 0);

      for (let user of usersList) {
        // Today's attendance: leave emp1User unchecked so the user can test the Check-In button live!
        if (dayOffset === 0 && user._id.toString() === emp1User._id.toString()) {
          continue;
        }

        const isLate = Math.random() < 0.2;
        const checkInHour = isLate ? 9 : 8;
        const checkInMinute = isLate ? Math.floor(Math.random() * 20) + 35 : Math.floor(Math.random() * 30) + 45;

        const checkInTime = new Date(recordDate);
        checkInTime.setHours(checkInHour, checkInMinute, 0);

        let checkOutTime = null;
        let totalHours = 0;
        let status = isLate ? 'Late' : 'Present';

        if (dayOffset > 0) {
          checkOutTime = new Date(recordDate);
          checkOutTime.setHours(17, Math.floor(Math.random() * 30) + 15, 0);
          totalHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));
        }

        await Attendance.create({
          employee: user._id,
          date: startOfDay,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          totalHours,
          status,
          notes: isLate ? 'Slight traffic delay on bridge' : 'On-site regular shift',
        });
      }
    }

    console.log('[StaffSync Seeder] Creating leave records...');
    await Leave.create([
      {
        employee: emp1User._id,
        leaveType: 'Annual',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8),
        daysCount: 3,
        reason: 'Family vacation and personal downtime',
        status: 'Approved',
        reviewedBy: engManagerUser._id,
        reviewedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12),
        managerComment: 'Approved. Enjoy your time off!',
      },
      {
        employee: emp2User._id,
        leaveType: 'Sick',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        daysCount: 2,
        reason: 'Viral fever and doctor consultation',
        status: 'Pending',
      },
      {
        employee: emp3User._id,
        leaveType: 'Casual',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        daysCount: 1,
        reason: 'Personal urgent appointment',
        status: 'Pending',
      },
      {
        employee: emp4User._id,
        leaveType: 'Annual',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
        daysCount: 4,
        reason: 'Attending sibling wedding ceremony out of state',
        status: 'Pending',
      },
      {
        employee: emp1User._id,
        leaveType: 'Casual',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6),
        daysCount: 2,
        reason: 'Home relocation and shifting',
        status: 'Pending',
      },
    ]);

    console.log('[StaffSync Seeder] Creating announcements...');
    await Announcement.create([
      {
        title: 'Welcome to StaffSync - Modern HRMS Platform Launch!',
        content:
          'We are delighted to introduce StaffSync, our centralized enterprise HR management portal. Manage your attendance, leave applications, training sessions, and stay connected with organizational updates seamlessly.',
        priority: 'High',
        category: 'General',
        isPinned: true,
        postedBy: hrUser._id,
      },
      {
        title: 'Q4 Annual Company Retreat & Team Building 2026',
        content:
          'Get ready! Our annual company summit and retreat will take place in Lake Tahoe from November 15-18. Registration and flight coordination details will be shared by the HR team shortly.',
        priority: 'High',
        category: 'Event',
        isPinned: true,
        postedBy: hrUser._id,
      },
      {
        title: 'Updated Comprehensive Health Insurance Policy',
        content:
          'Our corporate health and wellness benefits have been expanded to include comprehensive dental, vision, and mental health stipends. Please review the updated policy handbook in the resource repository.',
        priority: 'Medium',
        category: 'Policy',
        isPinned: false,
        postedBy: hrUser._id,
      },
      {
        title: 'Scheduled Cloud Server Maintenance Window',
        content:
          'Internal infrastructure and staging microservices will undergo routine security patching this Saturday between 02:00 AM and 04:00 AM UTC. No production downtime is anticipated.',
        priority: 'Low',
        category: 'Urgent',
        isPinned: false,
        postedBy: engManagerUser._id,
      },
    ]);

    console.log('[StaffSync Seeder] Creating training programs...');
    await Training.create([
      {
        title: 'Mastering Modern MERN Stack & Microservices Architecture',
        description:
          'Comprehensive deep-dive into full stack MERN architectures, caching patterns with Redis, containerization with Docker, and clean RESTful API design.',
        category: 'Technical',
        trainer: 'David K. Miller (Principal Architect)',
        department: 'Engineering',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18),
        maxParticipants: 25,
        enrolledEmployees: [emp1User._id, emp2User._id],
        status: 'Upcoming',
        locationUrl: 'https://meet.google.com/xyz-staffsync-tech',
      },
      {
        title: 'High-Impact Leadership & Empathetic Management',
        description:
          'Equipping engineering and departmental leaders with modern people management frameworks, constructive feedback techniques, and high-performance team coaching.',
        category: 'Leadership',
        trainer: 'Dr. Rachel Adams (Executive Coach)',
        department: 'All',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        maxParticipants: 15,
        enrolledEmployees: [engManagerUser._id, salesManagerUser._id, emp1User._id],
        status: 'Ongoing',
        locationUrl: 'Auditorium Hall A & Zoom Live',
      },
      {
        title: 'Corporate Data Security, GDPR & SOC2 Compliance 2026',
        description:
          'Essential security protocols, data privacy guidelines, phishing mitigation strategies, and annual compliance certification required for all employees.',
        category: 'Compliance',
        trainer: 'Alex Chen (Chief Security Officer)',
        department: 'All',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12),
        maxParticipants: 50,
        enrolledEmployees: [emp3User._id, emp4User._id],
        status: 'Upcoming',
        locationUrl: 'https://meet.google.com/soc2-annual-compliance',
      },
    ]);

    console.log('[StaffSync Seeder] Creating notifications...');
    await Notification.create([
      {
        recipient: emp1User._id,
        title: 'Leave Approved',
        message: 'Your recent Annual Leave request has been approved by Marcus Brody.',
        type: 'leave',
        link: '/leaves',
      },
      {
        recipient: emp1User._id,
        title: 'Training Registration Confirmed',
        message: 'You are enrolled in "Mastering Modern MERN Stack". Session starts soon.',
        type: 'training',
        link: '/trainings',
      },
      {
        recipient: hrUser._id,
        title: 'Pending Leave Approvals',
        message: 'You have 3 pending leave applications waiting for departmental review.',
        type: 'leave',
        link: '/leaves',
      },
      {
        recipient: engManagerUser._id,
        title: 'Team Member Leave Application',
        message: 'Jane Smith applied for 2 days of Sick Leave.',
        type: 'leave',
        link: '/leaves',
      },
    ]);

    console.log('------------------------------------------------------------');
    console.log(' [StaffSync] Database Seeded Successfully!');
    console.log('------------------------------------------------------------');
    console.log(' DEMO CREDENTIALS:');
    console.log(' 1. HR Admin:    hr@staffsync.com          | Password: password123');
    console.log(' 2. Manager:     manager.tech@staffsync.com | Password: password123');
    console.log(' 3. Employee:    employee@staffsync.com     | Password: password123');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[StaffSync Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
