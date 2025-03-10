# Hospital Queue Management System - Product Requirements Document

## 1. Introduction

### 1.1 Purpose
The Hospital Queue Management System is designed to efficiently manage patient queues across different hospital services and departments. It provides real-time queue management, patient calling, and status updates while integrating with existing hospital information systems.

### 1.2 Scope
This system will handle patient registration, queue management, and real-time updates for hospital services, supporting both scheduled appointments and walk-in patients.

## 2. Technical Stack

### 2.1 Frontend
- React.js for the user interface
- Real-time updates using WebSocket
- Modern UI components for better user experience

### 2.2 Backend
- Node.js with Express
- PostgreSQL database
- Prisma as ORM
- Restfull API client for integration with hospital systems

## 3. System Features

### 3.1 Patient Registration (HastaEkle)
- Register new patients with unique protocol numbers
- Collect patient information:
  - Name and surname
  - Queue number
  - Protocol number
  - Service ID and name
  - Priority status and reason
  - IP address for tracking

### 3.2 Patient Calling System (CagriYap)
- Call patients from the queue
- Support for:
  - New calls
  - Recall functionality
  - Test calls
- Display patient information:
  - Name (with masking option)
  - Queue number
  - Service name
  - Doctor name
  - Room/counter number

### 3.3 Queue Management (SiradakileriGuncelle)
- Real-time queue updates
- Track:
  - Number of waiting patients
  - Average examination time
  - Priority patients
  - Appointment status
- Support for multiple services and doctors

## 4. Database Schema

### 4.1 Core Tables
- Patients (Hasta)
- Services (Servis)
- Doctors (Doktor)
- Queue (Kuyruk)
- Users (Kullanici)
- Calls (Cagri)

### 4.2 Key Relationships
- Patient-Queue: One-to-Many
- Service-Doctor: One-to-Many
- Service-Queue: One-to-Many
- Doctor-Queue: One-to-Many

## 5. User Interface Requirements

### 5.1 Admin Dashboard
- Service management
- Doctor management
- Queue monitoring
- System settings
- Patient registration and management
- Queue assignment and control
- Priority management
- Appointment handling
- Patient calling functionality
- Status updates

### 5.2 Display Screens
- Main Display Components:
  - Hospital logo and name header
  - Current patient call information
  - Waiting patient count
  
- Patient Call Information Display:
  - Queue number (large and visible)
  - Department/Service name
  - Patient name (with privacy masking)
  - Room/Counter number
  - Visual and audio notifications

- Display Features:
  - High contrast color scheme
  - Large, readable fonts
  - Real-time WebSocket updates
  - Multi-screen support
  - Responsive layout for different screen sizes
  - Audio announcement system
- Current patient display
- Waiting list
- Service information
- Average waiting times

## 6. Integration Requirements

### 6.1 Restful API Integration
- Connect with hospital information system
  - HastaEkle
  - CagriYap
  - SiradakileriGuncelle

### 6.2 Authentication
- User authentication
- Role-based access control
- Secure API endpoints

## 7. Non-functional Requirements

### 7.1 Performance
- Response time < 2 seconds
- Support for multiple concurrent users
- Real-time updates < 1 second

### 7.2 Security
- Encrypted data transmission
- Secure user authentication
- Data privacy compliance

### 7.3 Availability
- 99.9% uptime
- Automatic failover
- Data backup and recovery

## 8. Future Enhancements

### 8.1 Potential Features
- Mobile app for patients
- SMS notifications
- Analytics dashboard
- Multi-language support

## 9. Implementation Phases

### Phase 1: Core Features
- Basic patient registration
- Queue management
- Display system

### Phase 2: Integration
- Restful API integration
- Real-time updates
- Authentication system

### Phase 3: Enhancement
- Advanced features
- Analytics
- Mobile support

## 10. Success Metrics

### 10.1 Key Performance Indicators
- Average waiting time reduction
- Patient satisfaction scores
- System response time
- Error rate reduction

### 10.2 Monitoring
- Real-time system monitoring
- Performance metrics tracking
- Error logging and analysis