const { execSync } = require('child_process');

// Load environment variables for local development
if (!process.env.VERCEL_ENV) {
    try {
        require('dotenv').config({ path: '.env.local' });
        require('dotenv').config(); // Fallback to .env
    } catch (e) {
        console.log('Note: dotenv not loaded (not a dev dependency or not found)');
    }
}

console.log('Starting custom database migration script...');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

const getConnectionString = () => {
    // Prioritize VERCEL_ENV as it distinguishes between 'production' and 'preview' deployments
    if (process.env.VERCEL_ENV === "production") {
        console.log('Environment: Production');
        const url = process.env.PROD_DATABASE_URL ||
            process.env.PROD_POSTGRES_PRISMA_URL ||
            process.env.DATABASE_URL;

        if (process.env.PROD_DATABASE_URL) console.log('Using PROD_DATABASE_URL');
        else if (process.env.PROD_POSTGRES_PRISMA_URL) console.log('Using PROD_POSTGRES_PRISMA_URL');
        else console.log('Using fallback DATABASE_URL for Production');

        return url;
    }

    if (
        process.env.VERCEL_ENV === "preview" ||
        process.env.VERCEL_ENV === "development"
    ) {
        console.log('Environment: Preview/Development');
        const url = process.env.PREVIEW_DATABASE_URL ||
            process.env.PREVIEW_POSTGRES_PRISMA_URL ||
            process.env.DATABASE_URL;

        if (process.env.PREVIEW_DATABASE_URL) console.log('Using PREVIEW_DATABASE_URL');
        else if (process.env.PREVIEW_POSTGRES_PRISMA_URL) console.log('Using PREVIEW_POSTGRES_PRISMA_URL');
        else console.log('Using fallback DATABASE_URL for Preview');

        return url;
    }

    // Fallback for local development or non-Vercel environments
    console.log('Environment: Local/Other');
    return process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
}

const connectionString = getConnectionString();

if (!connectionString) {
    console.error('Error: No valid database connection string found.');
    process.exit(1);
}

// Log masked URL for debugging
const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
console.log(`Target Database URL: ${maskedUrl}`);

try {
    // Run prisma migrate deploy with the specific DATABASE_URL
    // We pass it as an environment variable to the command
    console.log('Running: npx prisma migrate deploy');
    execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: {
            ...process.env,
            DATABASE_URL: connectionString,
            // Ensure we override all variants if Prisma checks them (though standard is DATABASE_URL)
            POSTGRES_PRISMA_URL: connectionString
        }
    });
    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
}
