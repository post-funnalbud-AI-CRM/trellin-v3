import { db } from '../db/index.js';
import { users, customers, employees, emailLogs, emailInsights } from '../db/schema.js';
import { analyzeEmail } from '../services/aiService.js';
import { eq } from 'drizzle-orm';

// Dummy data for seeding
const dummyUsers = [
  {
    name: 'John Smith',
    email: 'john@trellin.com',
    companyName: 'Trellin Inc.'
  }
];

const dummyCustomers = [
  {
    name: 'Acme Corp',
    primaryDomain: 'acme.com',
    knownEmails: ['contact@acme.com', 'support@acme.com', 'ceo@acme.com'],
    overallSentiment: 'neutral'
  },
  {
    name: 'TechStart Solutions',
    primaryDomain: 'techstart.io',
    knownEmails: ['hello@techstart.io', 'support@techstart.io'],
    overallSentiment: 'happy'
  },
  {
    name: 'Global Retail',
    primaryDomain: 'globalretail.com',
    knownEmails: ['info@globalretail.com', 'orders@globalretail.com'],
    overallSentiment: 'neutral'
  },
  {
    name: 'Innovate Labs',
    primaryDomain: 'innovatelabs.co',
    knownEmails: ['team@innovatelabs.co', 'projects@innovatelabs.co'],
    overallSentiment: 'happy'
  },
  {
    name: 'DataFlow Systems',
    primaryDomain: 'dataflow.com',
    knownEmails: ['admin@dataflow.com', 'tech@dataflow.com'],
    overallSentiment: 'unhappy'
  }
];

const dummyEmployees = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@trellin.com'
  },
  {
    name: 'Mike Chen',
    email: 'mike@trellin.com'
  },
  {
    name: 'Lisa Rodriguez',
    email: 'lisa@trellin.com'
  }
];

const emailTemplates = [
  // Happy/Positive emails
  {
    subject: 'Website Launch Success!',
    body: 'Hi team, I just wanted to say thank you for the amazing work on our new website. The launch went perfectly and we\'ve already seen a 40% increase in conversions. The design is exactly what we were looking for and the user experience is fantastic. Looking forward to working on the next phase!',
    sentiment: 'happy',
    customerIndex: 1
  },
  {
    subject: 'Project Update - Everything Looking Great',
    body: 'Hello! Just checking in to let you know that the new features you implemented are working perfectly. Our team is really happy with the results and our users are giving great feedback. The performance improvements are noticeable and everything is running smoothly.',
    sentiment: 'happy',
    customerIndex: 3
  },
  {
    subject: 'Thank you for the excellent support',
    body: 'I wanted to take a moment to express our gratitude for the outstanding support you\'ve provided. Your team has been incredibly responsive and the quality of work has exceeded our expectations. We\'re very pleased with our partnership.',
    sentiment: 'happy',
    customerIndex: 1
  },
  {
    subject: 'Great work on the latest update',
    body: 'The latest update you delivered is exactly what we needed. The new dashboard features are intuitive and our team is already using them effectively. The documentation was clear and the implementation was seamless.',
    sentiment: 'happy',
    customerIndex: 3
  },
  {
    subject: 'Project milestone achieved',
    body: 'We\'ve successfully completed the first phase of our project and the results are outstanding. Your team\'s expertise and dedication have been invaluable. The deliverables were on time and exceeded our quality expectations.',
    sentiment: 'happy',
    customerIndex: 1
  },
  // Neutral/Informational emails
  {
    subject: 'Website update request',
    body: 'Hi team, I was wondering if you could update our website with the new branding. We have the new logo and colors ready. This is not urgent but would be great to have done by the end of the month. Thanks!',
    sentiment: 'neutral',
    customerIndex: 0
  },
  {
    subject: 'Monthly report request',
    body: 'Could you please send us the monthly analytics report for our website? We need it for our board meeting next week. Also, could you include the conversion data from the last quarter?',
    sentiment: 'neutral',
    customerIndex: 2
  },
  {
    subject: 'Feature request - User dashboard',
    body: 'We\'re looking to add a new user dashboard feature to our platform. Could you provide an estimate for development time and cost? We\'d like to include user analytics, profile management, and notification settings.',
    sentiment: 'neutral',
    customerIndex: 0
  },
  {
    subject: 'Contract renewal discussion',
    body: 'Our current contract is up for renewal next month. We\'d like to discuss the terms and see if there are any new services or features we should consider. Can we schedule a call to review our options?',
    sentiment: 'neutral',
    customerIndex: 2
  },
  {
    subject: 'Technical consultation needed',
    body: 'We\'re planning to upgrade our infrastructure and would like to discuss the best approach. Could you provide some recommendations based on our current setup? We\'re looking at cloud migration options.',
    sentiment: 'neutral',
    customerIndex: 4
  },
  // Unhappy/Problem emails
  {
    subject: 'Website is down - URGENT',
    body: 'Our website has been down for the past 2 hours and we\'re losing customers. This is completely unacceptable. We need immediate assistance to get it back online. This is affecting our business significantly.',
    sentiment: 'unhappy',
    customerIndex: 4
  },
  {
    subject: 'Billing issue - Overcharged',
    body: 'I just received our monthly invoice and there are several charges that we didn\'t authorize. We\'re being charged for services we never requested. This needs to be resolved immediately as we\'re not paying for services we didn\'t use.',
    sentiment: 'unhappy',
    customerIndex: 4
  },
  {
    subject: 'Poor response time',
    body: 'It\'s been 3 days since I submitted a support ticket and I still haven\'t received a response. This is not the level of service we expect from you. We\'re paying for premium support and getting basic service.',
    sentiment: 'unhappy',
    customerIndex: 4
  },
  {
    subject: 'Feature not working as promised',
    body: 'The new feature you implemented last week is not working as described. We\'re experiencing bugs and the functionality is different from what was promised. This is causing issues for our users and we need it fixed ASAP.',
    sentiment: 'unhappy',
    customerIndex: 4
  },
  {
    subject: 'Disappointed with recent changes',
    body: 'The recent updates to our platform have made it more difficult to use. The interface changes are confusing our team and we\'re getting complaints from users. We need to roll back these changes or get them fixed immediately.',
    sentiment: 'unhappy',
    customerIndex: 4
  },
  // Follow-up emails
  {
    subject: 'Re: Website update request',
    body: 'Thanks for the quick response! The timeline you provided works perfectly for us. We\'ll have the new assets ready by next week. Looking forward to seeing the updated design.',
    sentiment: 'happy',
    customerIndex: 0
  },
  {
    subject: 'Re: Monthly report request',
    body: 'Perfect, thank you for sending the report so quickly. The data looks great and we\'ll use it in our presentation. Could you also include the mobile usage statistics in future reports?',
    sentiment: 'neutral',
    customerIndex: 2
  },
  {
    subject: 'Re: Feature request - User dashboard',
    body: 'The proposal looks good and the timeline works for us. We\'d like to proceed with the development. When can we start the project? Also, will you be providing regular updates during development?',
    sentiment: 'neutral',
    customerIndex: 0
  },
  {
    subject: 'Re: Contract renewal discussion',
    body: 'Thanks for the detailed proposal. We\'re interested in the premium support package you mentioned. Can we schedule a demo of the new features included in that tier?',
    sentiment: 'neutral',
    customerIndex: 2
  },
  {
    subject: 'Re: Technical consultation needed',
    body: 'The recommendations you provided are very helpful. We\'d like to move forward with the cloud migration plan. Can you provide a detailed project timeline and cost breakdown?',
    sentiment: 'neutral',
    customerIndex: 4
  }
];

// Generate additional emails with variations
const generateAdditionalEmails = () => {
  const additionalEmails = [];
  const subjects = [
    'Project status update',
    'New feature request',
    'Support ticket follow-up',
    'Performance optimization',
    'Security audit request',
    'Backup system inquiry',
    'API integration question',
    'Mobile app development',
    'Database optimization',
    'SSL certificate renewal',
    'Domain transfer request',
    'Email hosting setup',
    'Analytics implementation',
    'SEO optimization',
    'Content management system',
    'E-commerce integration',
    'Payment gateway setup',
    'User authentication system',
    'Data migration project',
    'Server maintenance schedule',
    'Backup restoration request',
    'Performance monitoring setup',
    'Security vulnerability report',
    'Compliance documentation',
    'Disaster recovery plan',
    'Load balancing configuration',
    'CDN setup inquiry',
    'Monitoring alert setup',
    'Log analysis request',
    'Backup verification',
    'System health check',
    'Database backup request',
    'SSL certificate installation',
    'Domain DNS configuration',
    'Email deliverability issue',
    'Website speed optimization',
    'Mobile responsiveness fix',
    'Search functionality update',
    'User registration system',
    'Password reset functionality',
    'Admin panel customization',
    'Report generation system',
    'Data export feature',
    'User permission management',
    'Notification system setup',
    'Integration testing request',
    'Deployment automation',
    'Code review process',
    'Documentation update',
    'Training session request',
    'Onboarding process inquiry'
  ];

  const bodies = [
    'Hi team, could you please provide an update on our current project status? We have a meeting with stakeholders tomorrow and need the latest information.',
    'We\'re looking to add some new features to our platform. Could you provide an estimate for development time and cost?',
    'I submitted a support ticket last week but haven\'t heard back yet. Could you please check the status and provide an update?',
    'Our website seems to be running slower than usual. Could you investigate the performance issues and optimize if needed?',
    'We need to conduct a security audit of our systems. Can you provide a comprehensive security assessment?',
    'Could you help us set up an automated backup system for our database? We want to ensure data safety.',
    'We\'re planning to integrate with a third-party API. Do you have experience with this type of integration?',
    'We\'re considering developing a mobile app. What would be the best approach for our current setup?',
    'Our database queries are taking longer than expected. Could you optimize the database performance?',
    'Our SSL certificate is expiring soon. Could you help us renew it and ensure everything is properly configured?',
    'We\'re looking to transfer our domain to a new registrar. Can you assist with the transfer process?',
    'We need to set up professional email hosting for our team. What options do you recommend?',
    'Could you help us implement Google Analytics and set up proper tracking for our website?',
    'We\'d like to improve our website\'s SEO. What optimizations would you recommend?',
    'We need a content management system for our website. What CMS would work best for our needs?',
    'We\'re planning to add e-commerce functionality to our website. What platform would you recommend?',
    'We need to set up a payment gateway for our online store. Can you help with the integration?',
    'We\'re looking to implement a secure user authentication system. What security measures should we consider?',
    'We need to migrate our data to a new system. Can you help plan and execute the migration?',
    'Could you provide a schedule for regular server maintenance? We want to ensure minimal downtime.',
    'We need to restore some files from our backup. Can you help with the restoration process?',
    'We\'d like to set up performance monitoring for our website. What tools would you recommend?',
    'We\'ve identified a potential security vulnerability. Can you investigate and provide a fix?',
    'We need to ensure our systems are compliant with industry standards. Can you provide compliance documentation?',
    'We need to create a disaster recovery plan. Can you help us develop a comprehensive strategy?',
    'We\'re experiencing high traffic and need load balancing. Can you help configure this?',
    'We\'d like to set up a CDN to improve our website performance. What CDN would you recommend?',
    'We need to set up monitoring alerts for our systems. Can you configure the alert system?',
    'We need to analyze our server logs to identify issues. Can you help with log analysis?',
    'Could you verify that our backup system is working correctly? We want to ensure data safety.',
    'We\'d like to schedule a system health check. Can you perform a comprehensive assessment?',
    'We need to create a backup of our database. Can you help with the backup process?',
    'We need to install an SSL certificate on our new server. Can you help with the installation?',
    'We need to configure DNS settings for our domain. Can you help with the configuration?',
    'We\'re having issues with email deliverability. Can you investigate and fix the problem?',
    'Our website is loading slowly. Can you optimize the speed and performance?',
    'Our website doesn\'t look good on mobile devices. Can you fix the mobile responsiveness?',
    'We need to update our search functionality. Can you improve the search features?',
    'We need to implement a user registration system. Can you help with the development?',
    'We\'re having issues with the password reset functionality. Can you fix this?',
    'We need to customize our admin panel. Can you help with the customization?',
    'We need to set up a report generation system. Can you help with the implementation?',
    'We need to add a data export feature to our platform. Can you help with this?',
    'We need to manage user permissions more effectively. Can you help set up role-based access?',
    'We need to set up a notification system for our users. Can you help with this?',
    'We need to test our integrations with third-party services. Can you help with testing?',
    'We need to automate our deployment process. Can you help set up CI/CD?',
    'We need to establish a code review process. Can you help set this up?',
    'We need to update our documentation. Can you help with the documentation?',
    'We need training for our team on the new features. Can you schedule a training session?',
    'We need to improve our onboarding process for new users. Can you help with this?'
  ];

  for (let i = 0; i < 50; i++) {
    const customerIndex = i % dummyCustomers.length;
    const sentiment = i % 3 === 0 ? 'happy' : i % 3 === 1 ? 'neutral' : 'unhappy';
    
    additionalEmails.push({
      subject: subjects[i % subjects.length],
      body: bodies[i % bodies.length],
      sentiment,
      customerIndex
    });
  }

  return additionalEmails;
};

// Combine all email templates
const allEmailTemplates = [...emailTemplates, ...generateAdditionalEmails()];

export const seedEmails = async () => {
  try {
    console.log('🌱 Starting email seeding process...');

    // Check if user already exists, if not create one
    let user;
    try {
      const existingUser = await db.select().from(users).where(eq(users.email, dummyUsers[0].email));
      if (existingUser.length > 0) {
        user = existingUser[0];
        console.log('✅ Using existing user:', user.name);
      } else {
        [user] = await db.insert(users).values(dummyUsers).returning();
        console.log('✅ Created test user:', user.name);
      }
    } catch (error) {
      console.log('⚠️ User already exists, using existing user');
      const existingUser = await db.select().from(users).where(eq(users.email, dummyUsers[0].email));
      user = existingUser[0];
    }

    // Create customers (handle existing)
    let createdCustomers;
    try {
      createdCustomers = await db.insert(customers).values(
        dummyCustomers.map(customer => ({ ...customer, userId: user.id }))
      ).returning();
      console.log('✅ Created', createdCustomers.length, 'customers');
    } catch (error) {
      console.log('⚠️ Customers already exist, using existing customers');
      createdCustomers = await db.select().from(customers).where(eq(customers.userId, user.id));
    }

    // Create employees (handle existing)
    let createdEmployees;
    try {
      createdEmployees = await db.insert(employees).values(
        dummyEmployees.map(employee => ({ ...employee, userId: user.id }))
      ).returning();
      console.log('✅ Created', createdEmployees.length, 'employees');
    } catch (error) {
      console.log('⚠️ Employees already exist, using existing employees');
      createdEmployees = await db.select().from(employees).where(eq(employees.userId, user.id));
    }

    // Generate and analyze emails
    const emailsToInsert = [];
    const insightsToInsert = [];

    for (let i = 0; i < allEmailTemplates.length; i++) {
      const template = allEmailTemplates[i];
      const customer = createdCustomers[template.customerIndex];
      const employee = createdEmployees[i % createdEmployees.length];
      
      // Generate timestamp (spread over the last 30 days)
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(Math.floor(Math.random() * 24));
      timestamp.setMinutes(Math.floor(Math.random() * 60));

      const emailData = {
        userId: user.id,
        employeeId: employee.id,
        customerId: customer.id,
        fromEmail: customer.knownEmails[0],
        toEmail: employee.email,
        subject: template.subject,
        body: template.body,
        timestamp,
        sentiment: template.sentiment,
        summary: '',
        actionNeeded: false,
        replied: Math.random() > 0.5,
        replyTimeMinutes: Math.random() > 0.5 ? Math.floor(Math.random() * 480) : null
      };

      emailsToInsert.push(emailData);
    }

    // Insert emails (handle existing)
    let createdEmails;
    try {
      createdEmails = await db.insert(emailLogs).values(emailsToInsert).returning();
      console.log('✅ Created', createdEmails.length, 'emails');
    } catch (error) {
      console.log('⚠️ Emails already exist, using existing emails');
      createdEmails = await db.select().from(emailLogs).where(eq(emailLogs.userId, user.id));
    }

    // Analyze emails with AI and create insights
    console.log('🤖 Analyzing emails with AI...');
    for (let i = 0; i < createdEmails.length; i++) {
      const email = createdEmails[i];
      
      try {
        const analysis = await analyzeEmail({
          subject: email.subject,
          body: email.body,
          fromEmail: email.fromEmail,
          toEmail: email.toEmail,
          timestamp: email.timestamp
        });

        const insightData = {
          emailId: email.id,
          sentiment: analysis.sentiment,
          summary: analysis.summary,
          waitingFor: analysis.waitingFor,
          recommendedAction: analysis.recommendedAction,
          isFlagged: analysis.isFlagged
        };

        insightsToInsert.push(insightData);
        
        // Update email with AI analysis
        await db.update(emailLogs)
          .set({
            sentiment: analysis.sentiment,
            summary: analysis.summary,
            actionNeeded: analysis.isFlagged
          })
          .where(eq(emailLogs.id, email.id));

      } catch (error) {
        console.error(`❌ Failed to analyze email ${i + 1}:`, error.message);
        // Use template sentiment as fallback
        const template = allEmailTemplates[i];
        insightsToInsert.push({
          emailId: email.id,
          sentiment: template.sentiment,
          summary: 'Analysis failed - using template data',
          waitingFor: '',
          recommendedAction: '',
          isFlagged: false
        });
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`📊 Processed ${i + 1}/${createdEmails.length} emails`);
      }
    }

    // Insert insights
    await db.insert(emailInsights).values(insightsToInsert);
    console.log('✅ Created', insightsToInsert.length, 'email insights');

    console.log('🎉 Email seeding completed successfully!');
    console.log(`📧 Total emails created: ${createdEmails.length}`);
    console.log(`🤖 Total insights created: ${insightsToInsert.length}`);

    return {
      user,
      customers: createdCustomers,
      employees: createdEmployees,
      emails: createdEmails,
      insights: insightsToInsert
    };

  } catch (error) {
    console.error('❌ Email seeding failed:', error);
    throw error;
  }
};

export default seedEmails;
