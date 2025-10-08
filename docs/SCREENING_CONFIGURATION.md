# Screening Configuration Guide

## Overview

The Applicant Screening system now supports dynamic, batch-specific configuration. This allows administrators to customize screening requirements for each batch without modifying code.

## Features

### Configurable Screening Checks

Each batch can have its own screening configuration with the following customizable checks:

#### 1. **Age Requirements**

-   Enable/Disable: Toggle age verification
-   Min Age: Minimum acceptable age (default: 18)
-   Max Age: Maximum acceptable age (default: 30)

#### 2. **Physical Attributes**

-   Enable/Disable: Toggle physical requirements check
-   Min Height: Minimum height in cm (default: 150)
-   Min Weight: Minimum weight in kg (default: 40)
-   Max Weight: Maximum weight in kg (default: 100)

#### 3. **Program Requirements**

-   Enable/Disable: Toggle program-specific checks
-   Allowed Education Levels: Custom list (overrides default program rules)
    -   Options: D3, D4, S1, S2

#### 4. **Education Requirements**

-   Enable/Disable: Toggle education verification
-   Valid Levels: Accepted education levels (default: D3, D4, S1, S2)
-   Require Diploma: Whether diploma is mandatory (default: true)

#### 5. **University & Certificate Verification**

-   Enable/Disable: Toggle PDDIKTI verification
-   Automatically verifies credentials through PDDIKTI service

#### 6. **Marital Status**

-   Enable/Disable: Toggle marital status check
-   Valid Statuses: Allowed marital statuses (default: Lajang)
    -   Options: Lajang, Menikah, Cerai

#### 7. **Continue Education**

-   Enable/Disable: Toggle education continuation check
-   Valid Options: Allowed responses (default: Tidak)
    -   Options: Ya, Tidak

## How to Configure

### From the Admin Panel

1. **Navigate to Batches Management**

    - Go to TalentHub → Batches

2. **Create or Edit a Batch**

    - Click "Add New Batch" or edit an existing batch
    - Scroll down to "Screening Configuration" section

3. **Configure Screening Rules**

    - Each section can be enabled/disabled using the toggle chip
    - Customize values for enabled checks
    - Leave fields empty to use defaults

4. **Save Changes**
    - Click "Create" or "Update" to save the configuration

### Configuration Structure (JSON)

```json
{
    "age": {
        "enabled": true,
        "min_age": 18,
        "max_age": 30
    },
    "physical": {
        "enabled": true,
        "min_height": 150,
        "min_weight": 40,
        "max_weight": 100
    },
    "program": {
        "enabled": true,
        "allowed_education_levels": ["D3", "D4", "S1", "S2"]
    },
    "education": {
        "enabled": true,
        "valid_levels": ["D3", "D4", "S1", "S2"],
        "require_diploma": true
    },
    "university": {
        "enabled": true
    },
    "marital": {
        "enabled": true,
        "valid_statuses": ["Lajang"]
    },
    "continue_education": {
        "enabled": true,
        "valid_options": ["Tidak"]
    }
}
```

## Backend Implementation

### Database

-   **Table**: `batch`
-   **Column**: `screening_config` (JSON, nullable)
-   **Migration**: `2025_10_08_153858_add_screening_config_to_batch_table.php`

### Job Processing

The `ApplicantScreeningJob` automatically reads and applies the batch-specific configuration:

1. Fetches the applicant's batch configuration
2. Applies configured checks (skips disabled checks)
3. Uses custom values or defaults
4. Logs screening results with configuration context

### Model

```php
// Batch Model
protected $fillable = [
    // ... other fields
    'screening_config',
];

protected $casts = [
    // ... other casts
    'screening_config' => 'array',
];
```

## Frontend Components

### ScreeningConfigSection

Located at: `frontend/src/feature/talenthub/screen/batches/components/ScreeningConfigSection.tsx`

Provides a comprehensive UI for configuring screening rules with:

-   Accordion-based interface
-   Enable/disable toggles
-   Number inputs for thresholds
-   Multi-select for valid options

### BatchFormModal

Enhanced to include screening configuration section

### BatchDetailModal

Displays configured screening rules for batch details

## Use Cases

### Example 1: Different Age Requirements

```
Batch A (Estate Program):
- Age: 20-28 years

Batch B (Mill Program):
- Age: 22-30 years
```

### Example 2: Program-Specific Education

```
Batch A:
- Only S1 and S2 allowed

Batch B:
- D3, D4, S1 allowed
```

### Example 3: Relaxed Physical Requirements

```
Batch A (Office roles):
- Physical checks: Disabled

Batch B (Field roles):
- Physical checks: Enabled
- Height: 160cm minimum
```

## Default Behavior

When `screening_config` is `null` or a check is not configured:

-   The system uses default hardcoded values
-   All checks are enabled by default
-   Maintains backward compatibility

## Migration Notes

-   Existing batches have `screening_config = null`
-   They will continue using default screening rules
-   Update configuration anytime without affecting past screenings

## Testing

1. Create a batch with custom screening config
2. Submit an application to that batch
3. Trigger screening job
4. Verify logs show custom configuration being used
5. Check screening results match configured rules

## API Response

Batch API responses now include `screening_config`:

```json
{
    "id": "uuid",
    "number": 1,
    "location": "Jakarta",
    "screening_config": {
        "age": {
            "enabled": true,
            "min_age": 20,
            "max_age": 28
        }
        // ... other config
    }
}
```

## Troubleshooting

**Q: Screening not using my config?**

-   Verify config is saved in database
-   Check job logs for configuration loading
-   Ensure batch relationship is correct

**Q: How to disable a specific check?**

-   Set `enabled: false` for that check section
-   Or remove the section entirely

**Q: Can I update config for existing batches?**

-   Yes, edit the batch and update configuration
-   Only affects new screenings, not completed ones

## Future Enhancements

Potential additions:

-   Template configurations
-   Bulk apply config to multiple batches
-   Configuration versioning
-   Config validation rules
-   Import/export configurations
