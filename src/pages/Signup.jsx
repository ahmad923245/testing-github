import { useState } from "react";
import { supabase } from "../utils/supabase";

export default function SignUp() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
        },
      },
    });

    const { error: singupError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name: form.name,
      email: form.email,
      role: "customer",

 
    })

    if (singupError) {
      console.log(error)
    }

    setLoading(false);

    if (error) {
      return alert(error.message);
    }

    alert("Signup successful.");
    console.log(data);
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
      />

      <br />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <br />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />

      <br />

      <button disabled={loading}>
        {loading ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}