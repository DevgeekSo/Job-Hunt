import { PrismaClient, UserRole, JobType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const jobs = [
    {
        title: "Guidewire Developer-Consultant",
        company: "Deloitte",
        location: "Bengaluru, Karnataka",
        description: "Experienced in developing software solutions using industry standard delivery methodologies like Agile, Waterfall across different architectural patterns.",
        salary: "Not available",
        type: "FULL_TIME"
    },
    {
        title: "Software Engineering Intern",
        company: "Google",
        location: "Hyderabad, Telangana",
        description: "Research, create, and develop software applications to extend and improve on Google's product offering.",
        salary: "Internship",
        type: "INTERNSHIP"
    },
    {
        title: "Associate Software Engineer",
        company: "CompanyBench",
        location: "Remote",
        description: "A passion for technology and a willingness to learn. Collaborate with diverse teams to design, develop, and implement innovative solutions.",
        salary: "Not available",
        type: "REMOTE"
    },
    {
        title: "Software Engineer II",
        company: "Microsoft",
        location: "Hyderabad, Telangana",
        description: "Successful candidates should have ability to ramp up quickly on new technologies, Experience in building Full stack features...",
        salary: "Full-time",
        type: "FULL_TIME"
    }
]

async function main() {
    // Use a hardcoded hash to avoid runtime issues if bcrypt fails, but better to use it.
    // Hash for "password": $2a$10$y5... (just generating a new one is safer if env works)
    const password = await bcrypt.hash("password", 10)

    // Create Candidate
    await prisma.user.upsert({
        where: { email: 'candidate@jobhunt.com' },
        update: {},
        create: {
            email: 'candidate@jobhunt.com',
            name: 'Candidate User',
            password,
            role: UserRole.CANDIDATE,
            profile: {
                create: {
                    bio: 'Passionate developer looking for opportunities.',
                    skills: ['React', 'Next.js', 'Node.js']
                }
            }
        }
    })

    // Create Jobs
    for (const job of jobs) {
        const employerEmail = `recruiter@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`

        // Check if employer exists to avoid unique constraint error on user creation if multiple jobs same company
        let employer = await prisma.user.findUnique({
            where: { email: employerEmail },
            include: { company: true }
        })

        if (!employer) {
            employer = await prisma.user.create({
                data: {
                    email: employerEmail,
                    name: `${job.company} Recruiter`,
                    password,
                    role: UserRole.EMPLOYER,
                    company: {
                        create: {
                            name: job.company,
                            location: job.location,
                            description: `We are ${job.company}.`
                        }
                    }
                },
                include: { company: true }
            })
        }

        if (employer.company) {
            await prisma.job.create({
                data: {
                    title: job.title,
                    description: job.description,
                    salary: job.salary,
                    location: job.location,
                    companyId: employer.company.id,
                    jobType: (job.type === 'REMOTE' ? 'REMOTE' : job.type === 'INTERNSHIP' ? 'INTERNSHIP' : 'FULL_TIME') as JobType
                }
            })
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
