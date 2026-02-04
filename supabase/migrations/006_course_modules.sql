-- Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update lessons table to reference modules
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order_index ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

-- Enable RLS
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_modules
CREATE POLICY "Anyone can view published course modules" ON course_modules FOR SELECT USING (
    is_published = true AND
    EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = course_modules.course_id 
        AND courses.is_published = true
    )
);

-- Add updated_at trigger
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

