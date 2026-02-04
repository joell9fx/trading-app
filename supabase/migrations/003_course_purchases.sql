-- Migration: Add course purchases and enrollment system
-- This migration adds course pricing and enrollment tracking

-- Step 1: Add price fields to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Step 2: Create course_enrollments table (purchases/enrollments)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method TEXT,
  payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Step 3: Create function to calculate course completion percentage
CREATE OR REPLACE FUNCTION calculate_course_progress(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_progress DECIMAL(5, 2);
BEGIN
  -- Get total lessons in course
  SELECT COUNT(*) INTO v_total_lessons
  FROM lessons
  WHERE course_id = p_course_id
    AND is_published = true;

  -- If no lessons, return 0
  IF v_total_lessons = 0 THEN
    RETURN 0;
  END IF;

  -- Get completed lessons
  SELECT COUNT(*) INTO v_completed_lessons
  FROM progress p
  JOIN lessons l ON l.id = p.lesson_id
  WHERE p.user_id = p_user_id
    AND l.course_id = p_course_id
    AND p.completed = true
    AND l.is_published = true;

  -- Calculate percentage
  v_progress := (v_completed_lessons::DECIMAL / v_total_lessons::DECIMAL) * 100;

  RETURN ROUND(v_progress, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create view for course enrollment with progress
CREATE OR REPLACE VIEW course_enrollments_with_progress AS
SELECT 
  ce.*,
  calculate_course_progress(ce.user_id, ce.course_id) as completion_percentage,
  (
    SELECT COUNT(*)
    FROM lessons l
    WHERE l.course_id = ce.course_id
      AND l.is_published = true
  ) as total_lessons,
  (
    SELECT COUNT(*)
    FROM progress p
    JOIN lessons l ON l.id = p.lesson_id
    WHERE p.user_id = ce.user_id
      AND l.course_id = ce.course_id
      AND p.completed = true
      AND l.is_published = true
  ) as completed_lessons
FROM course_enrollments ce
WHERE ce.status = 'active';

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_is_free ON courses(is_free);

-- Step 6: Enable RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policies
CREATE POLICY "Users can view their own enrollments" 
  ON course_enrollments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" 
  ON course_enrollments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" 
  ON course_enrollments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'ADMIN'
    )
  );

-- Step 8: Create trigger to update updated_at
CREATE TRIGGER update_course_enrollments_updated_at 
  BEFORE UPDATE ON course_enrollments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Update existing courses to be free by default (can be changed later)
UPDATE courses SET is_free = true WHERE price IS NULL OR price = 0;


