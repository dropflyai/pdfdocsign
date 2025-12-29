#!/bin/bash
# Run Supabase Migration
# This script opens the Supabase SQL Editor with the migration ready to run

PROJECT_REF="zoiewcelmnaasbsfcjaj"
SQL_FILE="$(dirname "$0")/../supabase/migrations/001_initial_schema.sql"

echo "=========================================="
echo "Supabase Migration Runner"
echo "=========================================="

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "Error: Migration file not found at $SQL_FILE"
    exit 1
fi

echo "Migration file: $SQL_FILE"
echo ""

# Copy SQL to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    cat "$SQL_FILE" | pbcopy
    echo "✓ SQL copied to clipboard!"
    echo ""
fi

echo "Opening Supabase SQL Editor..."
echo ""

# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

echo "=========================================="
echo "INSTRUCTIONS:"
echo "=========================================="
echo "1. The SQL Editor should open in your browser"
echo "2. Paste the SQL (Cmd+V) - it's already in your clipboard"
echo "3. Click 'Run' to execute the migration"
echo "4. Done! Your database is now set up."
echo ""
echo "If browser didn't open, go to:"
echo "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo ""
